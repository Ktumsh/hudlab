"use client";

import { useCallback } from "react";
import useSWRMutation from "swr/mutation";

import type { Comment } from "@/lib/types";

import { apiPost } from "@/lib/fetcher";

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
  const { trigger: triggerToggle } = useSWRMutation(
    "/api/interactions/toggle-comment-like",
    async (_url, { arg }: { arg: { commentId: string } }) =>
      apiPost<{
        success: boolean;
        isLiked?: boolean;
        likesCount?: number;
        error?: string;
      }>("/api/interactions/toggle-comment-like", { body: arg }),
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
          return { ...comment, replies: updatedReplies };
        }

        return comment;
      });
    },
    [],
  );

  const handleToggleCommentLike = useCallback(
    async (commentId: string) => {
      // Actualización optimista del estado de like del comentario
      onCommentsUpdate?.((prevComments) =>
        updateCommentInStructure(prevComments, commentId, (comment) => {
          const newIsLiked = !comment.liked;
          const newLikesCount = newIsLiked
            ? comment.likes + 1
            : comment.likes - 1;

          return {
            ...comment,
            liked: newIsLiked,
            likes: newLikesCount,
          };
        }),
      );

      try {
        const result = await triggerToggle({ commentId });

        if (result.success) {
          // Actualizar con valores reales del servidor
          onCommentsUpdate?.((prevComments) =>
            updateCommentInStructure(prevComments, commentId, (comment) => ({
              ...comment,
              liked: result.isLiked || false,
              likes: result.likesCount || 0,
            })),
          );

          return { success: true, isLiked: result.isLiked };
        } else {
          // Revertir la actualización optimista
          onCommentsUpdate?.((prevComments) =>
            updateCommentInStructure(prevComments, commentId, (comment) => {
              const revertIsLiked = !comment.liked;
              const revertLikesCount = revertIsLiked
                ? comment.likes + 1
                : comment.likes - 1;

              return {
                ...comment,
                liked: revertIsLiked,
                likes: revertLikesCount,
              };
            }),
          );

          return { success: false, error: result.error };
        }
      } catch {
        // Revertir la actualización optimista en caso de error
        onCommentsUpdate?.((prevComments) =>
          updateCommentInStructure(prevComments, commentId, (comment) => {
            const revertIsLiked = !comment.liked;
            const revertLikesCount = revertIsLiked
              ? comment.likes + 1
              : comment.likes - 1;

            return {
              ...comment,
              liked: revertIsLiked,
              likes: revertLikesCount,
            };
          }),
        );

        return { success: false, error: "Error al toggle like del comentario" };
      }
    },
    [onCommentsUpdate, updateCommentInStructure, triggerToggle],
  );

  return {
    handleToggleCommentLike,
  };
};
