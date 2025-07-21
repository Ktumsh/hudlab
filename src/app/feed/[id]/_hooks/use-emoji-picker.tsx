"use client";

import { useState, useCallback } from "react";

import type { Emoji } from "frimousse";

interface UseEmojiPickerReturn {
  showEmojiPicker: boolean;
  emojiPickerOpenMap: { [key: string]: boolean };

  setShowEmojiPicker: (open: boolean) => void;
  setEmojiPickerOpen: (id: string, open: boolean) => void;
  isEmojiPickerOpen: (id: string) => boolean;

  handleCommentEmoji: (
    setContent: React.Dispatch<React.SetStateAction<string>>,
    focusRef?: React.RefObject<HTMLTextAreaElement>,
  ) => (emoji: Emoji) => void;

  handleReplyEmoji: (
    id: string,
    setContent: (id: string, content: string) => void,
    getContent: (id: string) => string,
    focusRef?: React.RefObject<HTMLTextAreaElement>,
  ) => (emoji: Emoji) => void;

  handleEditEmoji: (
    setContent: React.Dispatch<React.SetStateAction<string>>,
    editingId: string | null,
  ) => (emoji: Emoji) => void;
}

export const useEmojiPicker = (): UseEmojiPickerReturn => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerOpenMap, setEmojiPickerOpenMap] = useState<{
    [key: string]: boolean;
  }>({});

  const setEmojiPickerOpen = useCallback((id: string, open: boolean) => {
    setEmojiPickerOpenMap((prev) => ({ ...prev, [id]: open }));
  }, []);

  const isEmojiPickerOpen = useCallback(
    (id: string) => !!emojiPickerOpenMap[id],
    [emojiPickerOpenMap],
  );

  const handleCommentEmoji = useCallback(
    (
      setContent: React.Dispatch<React.SetStateAction<string>>,
      focusRef?: React.RefObject<HTMLTextAreaElement>,
    ) =>
      (emoji: Emoji) => {
        const symbol = emoji.emoji || "";
        setContent((prev) => prev + symbol);
        focusRef?.current?.focus();
        setShowEmojiPicker(false);
      },
    [],
  );

  const handleReplyEmoji = useCallback(
    (
      id: string,
      setContent: (id: string, content: string) => void,
      getContent: (id: string) => string,
      focusRef?: React.RefObject<HTMLTextAreaElement>,
    ) =>
      (emoji: Emoji) => {
        const symbol = emoji.emoji || "";
        const currentContent = getContent(id);
        setContent(id, currentContent + symbol);
        focusRef?.current?.focus();
        setEmojiPickerOpen(id, false);
      },
    [setEmojiPickerOpen],
  );

  const handleEditEmoji = useCallback(
    (
      setContent: React.Dispatch<React.SetStateAction<string>>,
      editingId: string | null,
    ) =>
      (emoji: Emoji) => {
        const symbol = emoji.emoji || "";
        setContent((prev) => prev + symbol);
        if (editingId) {
          setEmojiPickerOpen(editingId, false);
        }
      },
    [setEmojiPickerOpen],
  );

  return {
    showEmojiPicker,
    emojiPickerOpenMap,
    setShowEmojiPicker,
    setEmojiPickerOpen,
    isEmojiPickerOpen,
    handleCommentEmoji,
    handleReplyEmoji,
    handleEditEmoji,
  };
};
