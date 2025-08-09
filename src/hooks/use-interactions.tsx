"use client";

import { useState, useCallback, useEffect, useRef } from "react";

import { useRequestProtection } from "./use-request-protection";
import { useUser } from "./use-user";

import { apiPost } from "@/lib/fetcher";

interface UseInteractionsOptions {
  uploadId: string;
  initialLiked?: boolean;
  initialLikesCount: number;
  initialCommentsCount: number;
  onLikeSuccess?: (isLiked: boolean, likesCount: number) => void;
  onCommentsCountChange?: (count: number) => void;
}

interface UseInteractionsReturn {
  // Like states
  isLiked: boolean;
  likesCount: number;
  isLikeLoading: boolean;

  // Comment states
  commentsCount: number;

  // Actions
  handleToggleLike: () => Promise<void>;
  updateCommentsCount: (change: number) => void;
}

/**
 * Hook para manejar interacciones (likes y comentarios) con actualizaciones optimistas
 */
export const useInteractions = ({
  uploadId,
  initialLiked = false,
  initialLikesCount,
  initialCommentsCount,
  onLikeSuccess,
  onCommentsCountChange,
}: UseInteractionsOptions): UseInteractionsReturn => {
  const { user } = useUser();

  // Estados locales con valores iniciales
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  // Estados de carga
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const likeEndpoint = `/api/interactions/toggle-like`;
  // (Opcional) Podríamos usar useOptimisticSWRMutation si se requiere cache central de uploads.

  const { executeRequest: protectedToggleLike } = useRequestProtection(
    async () => {
      try {
        return await apiPost<{
          success: boolean;
          isLiked: boolean;
          likesCount: number;
        }>(likeEndpoint, { body: { uploadId } });
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : "Error",
          isLiked: isLiked,
          likesCount,
        };
      }
    },
    {
      debounceMs: 300,
      throttleMs: 1000,
      maxRetries: 3,
    },
  );

  const handleToggleLike = useCallback(async () => {
    if (!user) return;

    // ✅ ESTADO OPTIMISTA: Actualización INMEDIATA (sin protecciones)
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    setIsLikeLoading(true);

    // 🛡️ PETICIÓN HTTP: Protegida contra abuso (sin bloquear el estado optimista)
    try {
      const result = (await protectedToggleLike()) as {
        success: boolean;
        isLiked?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (result.success) {
        // Actualizar con los valores reales del servidor
        if (
          typeof result.isLiked === "boolean" &&
          typeof result.likesCount === "number"
        ) {
          setIsLiked(result.isLiked);
          setLikesCount(result.likesCount);
          onLikeSuccess?.(result.isLiked, result.likesCount);
        }
      } else {
        // Revertir la actualización optimista en caso de error
        setIsLiked(!newIsLiked);
        setLikesCount(likesCount);
        console.error("Error toggling like:", result.error);
      }
    } catch (error) {
      // Revertir la actualización optimista en caso de error
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
      console.error("Error toggling like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  }, [user, isLiked, likesCount, onLikeSuccess, protectedToggleLike]);

  const updateCommentsCount = useCallback(
    (change: number) => {
      setCommentsCount((prev) => {
        const newCount = Math.max(0, prev + change);
        return newCount;
      });
    },
    [], // Sin dependencias - solo actualiza el estado local
  );

  // Efecto para notificar cambios al componente padre
  const notifyParentRef = useRef(onCommentsCountChange);
  notifyParentRef.current = onCommentsCountChange;

  useEffect(() => {
    notifyParentRef.current?.(commentsCount);
  }, [commentsCount]);

  return {
    // Like states
    isLiked,
    likesCount,
    isLikeLoading,

    // Comment states
    commentsCount,

    // Actions
    handleToggleLike,
    updateCommentsCount,
  };
};
