"use client";

import { useEffect } from "react";

interface UseSearchShortcutsProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onFocus?: () => void;
}

export const useSearchShortcuts = ({
  isOpen,
  onToggle,
  onClose,
  onFocus,
}: UseSearchShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K: Toggle modal (abrir/cerrar)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();

        if (isOpen) {
          onClose();
        } else {
          onToggle();
          // Auto-focus después de abrir
          if (onFocus) {
            setTimeout(() => {
              onFocus();
            }, 100);
          }
        }
      }

      // ESC: Solo cerrar si está abierto
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle, onClose, onFocus]);
};
