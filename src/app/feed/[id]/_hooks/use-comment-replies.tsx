"use client";

import { useState, useCallback } from "react";

interface UseCommentRepliesReturn {
  replyingId: string | null;
  replyContentMap: { [key: string]: string };
  expandedReplies: { [key: string]: boolean };

  setReplyingId: (id: string | null) => void;
  setReplyContent: (id: string, content: string) => void;
  getReplyContent: (id: string) => string;
  clearReplyContent: (id: string) => void;

  toggleReplies: (commentId: string) => void;
  isRepliesExpanded: (commentId: string) => boolean;
  hasBeenExpanded: (commentId: string) => boolean;

  startReply: (id: string) => void;
  cancelReply: () => void;
  isReplying: (id: string) => boolean;
}

export const useCommentReplies = (): UseCommentRepliesReturn => {
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyContentMap, setReplyContentMap] = useState<{
    [key: string]: string;
  }>({});
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [hasBeenExpandedMap, setHasBeenExpandedMap] = useState<{
    [key: string]: boolean;
  }>({});

  const setReplyContent = useCallback((id: string, content: string) => {
    setReplyContentMap((prev) => ({ ...prev, [id]: content }));
  }, []);

  const getReplyContent = useCallback(
    (id: string) => replyContentMap[id] || "",
    [replyContentMap],
  );

  const clearReplyContent = useCallback((id: string) => {
    setReplyContentMap((prev) => ({ ...prev, [id]: "" }));
  }, []);

  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies((prev) => {
      const wasExpanded = prev[commentId];
      const newExpanded = !wasExpanded;

      // Si se está expandiendo, marcar como "ha sido expandido"
      if (newExpanded) {
        setHasBeenExpandedMap((prevExpanded) => ({
          ...prevExpanded,
          [commentId]: true,
        }));
      }

      return {
        ...prev,
        [commentId]: newExpanded,
      };
    });
  }, []);

  const isRepliesExpanded = useCallback(
    (commentId: string) => !!expandedReplies[commentId],
    [expandedReplies],
  );

  const hasBeenExpanded = useCallback(
    (commentId: string) => !!hasBeenExpandedMap[commentId],
    [hasBeenExpandedMap],
  );

  const startReply = useCallback((id: string) => {
    setReplyingId(id);
  }, []);

  const cancelReply = useCallback(() => {
    if (replyingId) {
      clearReplyContent(replyingId);
    }
    setReplyingId(null);
  }, [replyingId, clearReplyContent]);

  const isReplying = useCallback(
    (id: string) => replyingId === id,
    [replyingId],
  );

  return {
    replyingId,
    replyContentMap,
    expandedReplies,
    setReplyingId,
    setReplyContent,
    getReplyContent,
    clearReplyContent,
    toggleReplies,
    isRepliesExpanded,
    hasBeenExpanded,
    startReply,
    cancelReply,
    isReplying,
  };
};
