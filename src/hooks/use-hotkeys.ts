"use client";

import { useEffect } from "react";

export interface HotkeysOptions {
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPan?: (dx: number, dy: number) => void; // flechas
}

export function useHotkeys(opts: HotkeysOptions) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey; // soportar Cmd en macOS

      // Undo / Redo
      if (isCtrl && key === "z") {
        e.preventDefault();
        opts.onUndo?.();
        return;
      }
      if (isCtrl && key === "y") {
        e.preventDefault();
        opts.onRedo?.();
        return;
      }

      // Zoom con +/-
      if (key === "+" || key === "=") {
        e.preventDefault();
        opts.onZoomIn?.();
        return;
      }
      if (key === "-" || key === "_") {
        e.preventDefault();
        opts.onZoomOut?.();
        return;
      }

      // Pan con flechas
      if (["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
        e.preventDefault();
        const m = 20;
        let dx = 0,
          dy = 0;
        if (key === "arrowleft") dx = -m;
        if (key === "arrowright") dx = m;
        if (key === "arrowup") dy = -m;
        if (key === "arrowdown") dy = m;
        opts.onPan?.(dx, dy);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) opts.onZoomIn?.();
        else opts.onZoomOut?.();
      }
    };

    window.addEventListener("keydown", onKey, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [opts]);
}
