"use client";

import { useCallback } from "react";

import { toggleCommentLike } from "@/db/querys/interactions-querys";
import { useRequestProtection } from "@/hooks/use-request-protection";

import type { Comment } from "@/lib/types";

interface UseCommentLikesOptions {
  onCommentsUpdate?: (updater: (prev: Comment[]) => Comment[]) => void;
}

interface UseCommentLikesReturn {
  handleToggleCommentLike: (
    commentId: string,
  ) => Promise<{ success: boolean; isLiked?: boolean; error?: string }>;
}

/**
 * Hook para manejar likes de comentarios con actualizaciones optimistas
 */
export const useCommentLikes = ({
  onCommentsUpdate,
}: UseCommentLikesOptions): UseCommentLikesReturn => {
  // Protección de peticiones HTTP (NO afecta el estado optimista)
  const { executeRequest: protectedToggleCommentLike } = useRequestProtection(
    toggleCommentLike,
    {
      debounceMs: 300,
      throttleMs: 1000,
      maxRetries: 3,
    },
  );

  const updateCommentInStructure = useCallback(
    (
      commentsList: Comment[],
      commentId: string,
      updateFn: (comment: Comment) => Comment,
    ): Comment[] => {
      return commentsList.map((comment) => {
        // Si es el comentario buscado
        if (comment.id === commentId) {
          return updateFn(comment);
        }

        // Buscar recursivamente en todas las replies
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = updateCommentInStructure(
            comment.replies,
            commentId,
            updateFn,
          );

          // Solo actualizar si realmente cambió algo
          if (updatedReplies !== comment.replies) {
            return { ...comment, replies: updatedReplies };
          }
        }

        return comment;
      });
    },
    [], // Sin dependencias - es una función pura
  );

  const handleToggleCommentLike = useCallback(
    async (
      commentId: string,
    ): Promise<{ success: boolean; isLiked?: boolean; error?: string }> => {
      // Función helper para crear actualizaciones de like
      const createLikeUpdate = (isToggling: boolean) => (comment: Comment) => ({
        ...comment,
        liked: isToggling ? !comment.liked : comment.liked,
        likes: isToggling
          ? comment.liked
            ? Math.max(0, comment.likes - 1)
            : comment.likes + 1
          : comment.likes,
      });

      try {
        // ✅ ESTADO OPTIMISTA: Actualización INMEDIATA (sin protecciones)
        onCommentsUpdate?.((prev) =>
          updateCommentInStructure(prev, commentId, createLikeUpdate(true)),
        );

        // 🛡️ PETICIÓN HTTP: Protegida contra abuso
        const result = await protectedToggleCommentLike(commentId);

        if (!result.success) {
          // Revertir la actualización optimista en caso de error
          onCommentsUpdate?.(
            (prev) =>
              updateCommentInStructure(prev, commentId, createLikeUpdate(true)), // Volver a togglear = revertir
          );
        }

        return result;
      } catch (error) {
        console.error("Error toggling comment like:", error);

        // Revertir la actualización optimista
        onCommentsUpdate?.(
          (prev) =>
            updateCommentInStructure(prev, commentId, createLikeUpdate(true)), // Volver a togglear = revertir
        );

        return {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    },
    [onCommentsUpdate, updateCommentInStructure, protectedToggleCommentLike],
  );

  return {
    handleToggleCommentLike,
  };
};
