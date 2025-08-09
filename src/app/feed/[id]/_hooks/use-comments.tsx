"use client";

import { useCallback, useState, useMemo, useTransition } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import type { Comment, CommentWithRelations } from "@/lib/types";

import { mapComment } from "@/app/feed/[id]/_lib/utils";
import { useRequestProtection } from "@/hooks/use-request-protection";
import { useUser } from "@/hooks/use-user";
import { fetcher } from "@/lib";
import { apiPost } from "@/lib/fetcher";

interface UseCommentsOptions {
  publicId: string;
  uploadId: string;
  onCommentsCountChange?: (change: number) => void;
}

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
  currentUserProfileId: string | null;
  // Funciones de mutación
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
  isUpdating: boolean;
  isDeleting: boolean;
  isCommentLoading: boolean;
  deletingCommentIds: string[];
}

export function useComments({
  publicId,
  uploadId,
  onCommentsCountChange,
}: UseCommentsOptions): UseCommentsReturn {
  const { user } = useUser();
  const currentUserProfileId = user?.profile?.id || null;

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCommentIds, setDeletingCommentIds] = useState<string[]>([]);
  const [isCommentLoading, startCommentTransition] = useTransition();

  const { trigger: triggerDelete } = useSWRMutation(
    "/api/interactions/delete-comment",
    async (_url, { arg }: { arg: { commentId: string } }) => {
      const qs = new URLSearchParams({ commentId: arg.commentId }).toString();
      return apiPost<{ success: boolean }>(
        `/api/interactions/delete-comment?${qs}`,
        { method: "DELETE" },
      );
    },
  );
  const { trigger: triggerUpdate } = useSWRMutation(
    "/api/interactions/update-comment",
    async (_url, { arg }: { arg: { commentId: string; content: string } }) =>
      apiPost<{ success: boolean }>("/api/interactions/update-comment", {
        body: arg,
        method: "PUT",
      }),
  );
  const { trigger: triggerAddComment } = useSWRMutation(
    "/api/interactions/add-comment",
    async (_url, { arg }: { arg: { uploadId: string; content: string } }) =>
      apiPost<{ success: boolean; comment?: unknown }>(
        "/api/interactions/add-comment",
        { body: arg },
      ),
  );
  const { trigger: triggerAddReply } = useSWRMutation(
    "/api/interactions/add-reply",
    async (_url, { arg }: { arg: { commentId: string; content: string } }) =>
      apiPost<{ success: boolean; reply?: unknown }>(
        "/api/interactions/add-reply",
        { body: arg },
      ),
  );

  // Protección de peticiones HTTP
  const { executeRequest: protectedAddComment } = useRequestProtection(
    (uploadId: string, content: string) =>
      triggerAddComment({ uploadId, content }),
    {
      debounceMs: 500,
      throttleMs: 2000,
      maxRetries: 3,
    },
  );

  const { executeRequest: protectedAddReply } = useRequestProtection(
    (commentId: string, content: string) =>
      triggerAddReply({ commentId, content }),
    {
      debounceMs: 500,
      throttleMs: 1500,
      maxRetries: 3,
    },
  );

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<{ comments: CommentWithRelations[] }>(
    `/api/uploads/${publicId}/comments`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const comments: Comment[] = useMemo(() => {
    if (!response?.comments) return [];

    const mappedComments = response.comments.map((c) =>
      mapComment(c, currentUserProfileId || undefined),
    );

    const sorted = [
      ...mappedComments
        .filter((c) =>
          currentUserProfileId ? c.user.id === currentUserProfileId : false,
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      ...mappedComments
        .filter((c) =>
          currentUserProfileId ? c.user.id !== currentUserProfileId : true,
        )
        .sort((a, b) => b.likes - a.likes),
    ];

    return sorted;
  }, [response?.comments, currentUserProfileId]);

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      try {
        setIsDeleting(true);
        setDeletingCommentIds((prev) => [...prev, commentId]);

        await triggerDelete({ commentId });

        await mutate();

        return { success: true };
      } catch (error) {
        console.error("Error deleting comment:", error);
        return { success: false, error: "Error al eliminar el comentario" };
      } finally {
        setIsDeleting(false);
        setDeletingCommentIds((prev) => prev.filter((id) => id !== commentId));
      }
    },
    [triggerDelete, mutate],
  );

  const handleUpdateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        setIsUpdating(true);
        await triggerUpdate({ commentId, content });

        await mutate();

        return { success: true };
      } catch (error) {
        console.error("Error updating comment:", error);
        return { success: false, error: "Error al actualizar el comentario" };
      } finally {
        setIsUpdating(false);
      }
    },
    [triggerUpdate, mutate],
  );

  const handleAddComment = useCallback(
    async (content: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || isCommentLoading || !content.trim()) {
        return {
          success: false,
          error: "Usuario no autenticado o comentario vacío",
        };
      }

      return new Promise((resolve) => {
        startCommentTransition(async () => {
          try {
            const result = (await protectedAddComment(
              uploadId,
              content.trim(),
            )) as {
              success: boolean;
              comment?: unknown;
              error?: string;
            };

            if (result.success) {
              await mutate();
              onCommentsCountChange?.(1);
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
    [
      user,
      isCommentLoading,
      uploadId,
      onCommentsCountChange,
      protectedAddComment,
      mutate,
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

      return new Promise((resolve) => {
        startCommentTransition(async () => {
          try {
            const result = (await protectedAddReply(
              commentId,
              content.trim(),
            )) as {
              success: boolean;
              reply?: unknown;
              error?: string;
            };

            if (result.success) {
              await mutate();
              onCommentsCountChange?.(1);
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
    [user, isCommentLoading, onCommentsCountChange, protectedAddReply, mutate],
  );

  return {
    comments,
    isLoading,
    error,
    mutate,
    currentUserProfileId,
    handleAddComment,
    handleAddReply,
    handleDeleteComment,
    handleUpdateComment,
    isUpdating,
    isDeleting,
    isCommentLoading,
    deletingCommentIds,
  };
}
