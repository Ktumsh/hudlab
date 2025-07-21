"use client";

import { useState, useEffect, useCallback } from "react";

import {
  mapComment,
  flattenReplies,
  countTotalReplies,
  findReplyReference,
} from "@/app/feed/[id]/_lib/utils";
import { deleteComment, updateComment } from "@/db/querys/interactions-querys";
import { useUser } from "@/hooks/use-user";

import type { Comment, UploadWithFullDetails } from "@/lib/types";

interface UseCommentsOptions {
  upload: UploadWithFullDetails;
}

interface UseCommentsReturn {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;

  // Utility functions
  flattenReplies: (replies: Comment[]) => Comment[];
  countTotalReplies: (replies: Comment[]) => number;
  findReplyReference: (reply: Comment, replies?: Comment[]) => Comment | null;

  // UI states
  expandedReplies: { [key: string]: boolean };
  setExpandedReplies: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  toggleReplies: (commentId: string) => void;

  // Loading states
  isUpdating: boolean;
  isDeleting: boolean;

  // Current user
  currentUserProfileId?: string;

  // Database operations
  handleDeleteComment: (
    commentId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  handleUpdateComment: (
    commentId: string,
    content: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useComments = ({
  upload,
}: UseCommentsOptions): UseCommentsReturn => {
  const { user } = useUser();
  const currentUserProfileId = user?.profile?.id;

  // Mapear comentarios iniciales
  const initialMappedComments = Array.isArray(upload.comments)
    ? upload.comments.map((c) => mapComment(c, currentUserProfileId))
    : [];

  const [comments, setComments] = useState<Comment[]>(initialMappedComments);
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Actualizar comentarios cuando cambie el upload
  useEffect(() => {
    const mappedComments = Array.isArray(upload.comments)
      ? upload.comments.map((c) => mapComment(c, currentUserProfileId))
      : [];
    setComments(mappedComments);
  }, [upload.comments, currentUserProfileId]);

  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteComment(commentId);
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { success: false, error: "Error al eliminar el comentario" };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const handleUpdateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        setIsUpdating(true);
        const result = await updateComment(commentId, content);
        return { success: result.success, error: result.error };
      } catch (error) {
        console.error("Error updating comment:", error);
        return { success: false, error: "Error al actualizar el comentario" };
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  return {
    comments,
    setComments,

    // Utility functions
    flattenReplies,
    countTotalReplies,
    findReplyReference,

    // UI states
    expandedReplies,
    setExpandedReplies,
    toggleReplies,

    // Loading states
    isUpdating,
    isDeleting,

    // Current user
    currentUserProfileId,

    // Database operations
    handleDeleteComment,
    handleUpdateComment,
  };
};
