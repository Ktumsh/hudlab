"use client";

import { useState, useCallback } from "react";

interface UseCommentEditingReturn {
  editingId: string | null;
  editingContent: string;
  setEditingId: (id: string | null) => void;
  setEditingContent: (content: string) => void;
  startEdit: (id: string, content: string) => void;
  cancelEdit: () => void;
  isEditing: (id: string) => boolean;
}

export const useCommentEditing = (): UseCommentEditingReturn => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  const startEdit = useCallback((id: string, content: string) => {
    setEditingId(id);
    setEditingContent(content);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingContent("");
  }, []);

  const isEditing = useCallback((id: string) => editingId === id, [editingId]);

  return {
    editingId,
    editingContent,
    setEditingId,
    setEditingContent,
    startEdit,
    cancelEdit,
    isEditing,
  };
};
