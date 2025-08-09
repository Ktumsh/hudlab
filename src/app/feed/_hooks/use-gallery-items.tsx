"use client";

import { useMemo, useRef } from "react";

import type { UploadWithDetails } from "@/lib/types";

// Ya no usamos aspect ratios aleatorios; usamos alturas fijas estilo Pinterest

export type GalleryItem =
  | { type: "upload"; id: string; upload: UploadWithDetails }
  | { type: "skeleton"; id: string; height: number; hidden?: boolean };

export function useGalleryItems(
  uploads: UploadWithDetails[],
  loading: boolean,
  initialLoading: boolean,
  isReachingEnd: boolean,
  limit: number,
): GalleryItem[] {
  const lastHeightsRef = useRef<number[]>([]);
  const lastCount = useRef(0);

  const totalExpected =
    uploads.length + (loading || initialLoading || !isReachingEnd ? limit : 0);

  if (totalExpected > lastCount.current) {
    lastCount.current = totalExpected;
  }

  return useMemo(() => {
    const items: GalleryItem[] = [];

    const selectHeight = (): number => {
      // Alternamos entre 236 y 256px para dar variación mínima
      const candidates = [236, 256];
      const recent = lastHeightsRef.current.slice(-3);
      // Elige el que no sea igual al último si es posible
      const last = recent[recent.length - 1];
      const choice = candidates.find((h) => h !== last) ?? candidates[0];
      lastHeightsRef.current.push(choice);
      if (lastHeightsRef.current.length > 5) lastHeightsRef.current.shift();
      return choice;
    };

    for (let i = 0; i < lastCount.current; i++) {
      const upload = uploads[i];

      if (upload) {
        items.push({
          type: "upload",
          id: upload.id,
          upload,
        });
      } else {
        items.push({
          type: "skeleton",
          id: `skeleton-${i}`,
          height: selectHeight(),
          hidden: !loading && !initialLoading && isReachingEnd,
        } as GalleryItem);
      }
    }

    return items;
  }, [uploads, loading, initialLoading, isReachingEnd]);
}
