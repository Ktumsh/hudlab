"use client";

import { useTransition, useState, useCallback, useEffect, useRef } from "react";

import {
  toggleLike,
  addComment,
  addReply,
  deleteComment,
  updateComment,
} from "@/db/querys/interactions-querys";

import { useRequestProtection } from "./use-request-protection";
import { useUser } from "./use-user";

interface UseInteractionsOptions {
  uploadId: string;
  initialLiked?: boolean;
  initialLikesCount: number;
  initialCommentsCount: number;
  onLikeSuccess?: (isLiked: boolean, likesCount: number) => void;
  onCommentSuccess?: (comment: any) => void;
  onReplySuccess?: (reply: any) => void;
  onCommentsCountChange?: (count: number) => void;
}

interface UseInteractionsReturn {
  // Like states
  isLiked: boolean;
  likesCount: number;
  isLikeLoading: boolean;

  // Comment states
  commentsCount: number;
  isCommentLoading: boolean;

  // Actions
  handleToggleLike: () => Promise<void>;
  handleAddComment: (
    content: string,
  ) => Promise<{ success: boolean; error?: string }>;
  handleAddReply: (
    commentId: string,
    content: string,
  ) => Promise<{ success: boolean; error?: string }>;
  handleDeleteComment: (
    commentId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  handleUpdateComment: (
    commentId: string,
    content: string,
  ) => Promise<{ success: boolean; error?: string }>;
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
  onCommentSuccess,
  onReplySuccess,
  onCommentsCountChange,
}: UseInteractionsOptions): UseInteractionsReturn => {
  const { user } = useUser();

  // Estados locales con valores iniciales
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  // Estados de carga
  const [isLikeLoading, startLikeTransition] = useTransition();
  const [isCommentLoading, startCommentTransition] = useTransition();

  // 🛡️ Protección de peticiones HTTP (NO afecta estados optimistas)
  const { executeRequest: protectedToggleLike } = useRequestProtection(
    toggleLike,
    {
      debounceMs: 300,
      throttleMs: 1000,
      maxRetries: 3,
    },
  );

  const { executeRequest: protectedAddComment } = useRequestProtection(
    addComment,
    {
      debounceMs: 500,
      throttleMs: 2000,
      maxRetries: 3,
    },
  );

  const { executeRequest: protectedAddReply } = useRequestProtection(addReply, {
    debounceMs: 500,
    throttleMs: 1500,
    maxRetries: 3,
  });

  const { executeRequest: protectedDeleteComment } = useRequestProtection(
    deleteComment,
    {
      debounceMs: 200,
      throttleMs: 1000,
      maxRetries: 2,
    },
  );

  const { executeRequest: protectedUpdateComment } = useRequestProtection(
    updateComment,
    {
      debounceMs: 800,
      throttleMs: 2000,
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

    // 🛡️ PETICIÓN HTTP: Protegida contra abuso (sin bloquear el estado optimista)
    startLikeTransition(async () => {
      try {
        const result = await protectedToggleLike(uploadId);

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
      }
    });
  }, [user, isLiked, likesCount, uploadId, onLikeSuccess, protectedToggleLike]);

  const handleAddComment = useCallback(
    async (content: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || isCommentLoading || !content.trim()) {
        return {
          success: false,
          error: "Usuario no autenticado o comentario vacío",
        };
      }

      // ✅ ESTADO OPTIMISTA: Actualización INMEDIATA del contador
      const newCommentsCount = commentsCount + 1;
      setCommentsCount(newCommentsCount);

      return new Promise((resolve) => {
        startCommentTransition(async () => {
          try {
            // 🛡️ PETICIÓN HTTP: Protegida contra abuso
            const result = await protectedAddComment(uploadId, content.trim());

            if (result.success) {
              // El contador ya se actualizó optimistamente, mantenerlo
              onCommentSuccess?.(result.comment);
              resolve({ success: true });
            } else {
              // Revertir la actualización optimista
              setCommentsCount(commentsCount);
              resolve({ success: false, error: result.error });
            }
          } catch (error) {
            // Revertir la actualización optimista
            setCommentsCount(commentsCount);
            const errorMessage =
              error instanceof Error ? error.message : "Error desconocido";
            resolve({ success: false, error: errorMessage });
          }
        });
      });
    },
    [
      user,
      isCommentLoading,
      commentsCount,
      uploadId,
      onCommentSuccess,
      protectedAddComment,
    ],
  );

  const handleAddReply = useCallback(
    async (
      commentId: string,
      content: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user || isCommentLoading || !content.trim()) {
        return {
          success: false,
          error: "Usuario no autenticado o respuesta vacía",
        };
      }

      // ✅ ESTADO OPTIMISTA: Actualización INMEDIATA del contador
      const newCommentsCount = commentsCount + 1;
      setCommentsCount(newCommentsCount);

      return new Promise((resolve) => {
        startCommentTransition(async () => {
          try {
            // 🛡️ PETICIÓN HTTP: Protegida contra abuso
            const result = await protectedAddReply(commentId, content.trim());

            if (result.success) {
              // El contador ya se actualizó optimistamente, mantenerlo
              onReplySuccess?.(result.reply);
              resolve({ success: true });
            } else {
              // Revertir la actualización optimista
              setCommentsCount(commentsCount);
              resolve({ success: false, error: result.error });
            }
          } catch (error) {
            // Revertir la actualización optimista
            setCommentsCount(commentsCount);
            const errorMessage =
              error instanceof Error ? error.message : "Error desconocido";
            resolve({ success: false, error: errorMessage });
          }
        });
      });
    },
    [user, isCommentLoading, commentsCount, onReplySuccess, protectedAddReply],
  );

  const handleDeleteComment = useCallback(
    async (
      commentId: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      if (isCommentLoading) {
        return { success: false, error: "Operación en progreso" };
      }

      return new Promise((resolve) => {
        startCommentTransition(async () => {
          try {
            // 🛡️ PETICIÓN HTTP: Protegida contra abuso
            const result = await protectedDeleteComment(commentId);
            if (result.success && "deletedCount" in result) {
              // Actualizar contador de comentarios
              setCommentsCount(
                (prev) => prev - (result.deletedCount as number),
              );
              resolve({ success: true });
            } else {
              resolve({ success: false, error: result.error });
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Error desconocido";
            resolve({ success: false, error: errorMessage });
          }
        });
      });
    },
    [user, isCommentLoading, protectedDeleteComment],
  );

  const handleUpdateComment = useCallback(
    async (
      commentId: string,
      content: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      if (isCommentLoading) {
        return { success: false, error: "Operación en progreso" };
      }

      if (!content.trim()) {
        return { success: false, error: "El comentario no puede estar vacío" };
      }

      return new Promise((resolve) => {
        startCommentTransition(async () => {
          try {
            // 🛡️ PETICIÓN HTTP: Protegida contra abuso
            const result = await protectedUpdateComment(commentId, content);
            if (result.success) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: result.error });
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Error desconocido";
            resolve({ success: false, error: errorMessage });
          }
        });
      });
    },
    [user, isCommentLoading, protectedUpdateComment],
  );

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
    isCommentLoading,

    // Actions
    handleToggleLike,
    handleAddComment,
    handleAddReply,
    handleDeleteComment,
    handleUpdateComment,
    updateCommentsCount,
  };
};
