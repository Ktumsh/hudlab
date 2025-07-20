"use client";

import { useMemo, useRef } from "react";

import { aspectRatios } from "@/lib";

import type {
  UploadWithDetails,
  UploadWithProfileAndAspect,
} from "@/lib/types";

type GalleryItem =
  | { type: "upload"; id: string; upload: UploadWithProfileAndAspect }
  | { type: "skeleton"; id: string; aspectRatio: string };

export function useGalleryItems(
  uploads: UploadWithDetails[],
  loading: boolean,
  initialLoading: boolean,
  isReachingEnd: boolean,
  limit: number,
): GalleryItem[] {
  const aspectRatioMap = useRef(new Map<string, string>());
  const lastRatiosRef = useRef<string[]>([]);
  const lastCount = useRef(0);

  const totalExpected =
    uploads.length + (loading || initialLoading || !isReachingEnd ? limit : 0);

  if (totalExpected > lastCount.current) {
    lastCount.current = totalExpected;
  }

  return useMemo(() => {
    const items: GalleryItem[] = [];

    const selectSmartRatio = (): string => {
      const recentRatios = lastRatiosRef.current.slice(-3);
      let attempts = 0;
      let ratio: string;

      do {
        ratio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
        attempts++;
      } while (recentRatios.includes(ratio) && attempts < 10);

      // Actualizar historial
      lastRatiosRef.current.push(ratio);
      if (lastRatiosRef.current.length > 5) {
        lastRatiosRef.current.shift(); // Mantener solo los últimos 5
      }

      return ratio;
    };

    for (let i = 0; i < lastCount.current; i++) {
      const upload = uploads[i];

      if (upload) {
        // Asignar aspect ratio inteligente pero consistente para cada upload
        if (!aspectRatioMap.current.has(upload.id)) {
          const ratio = selectSmartRatio();
          aspectRatioMap.current.set(upload.id, ratio);
        }

        items.push({
          type: "upload",
          id: upload.id,
          upload: {
            ...upload,
            aspectRatio: aspectRatioMap.current.get(upload.id)!,
          },
        });
      } else {
        items.push({
          type: "skeleton",
          id: `skeleton-${i}`,
          aspectRatio: aspectRatios[i % aspectRatios.length],
          hidden: !loading && !initialLoading && isReachingEnd,
        } as any);
      }
    }

    return items;
  }, [uploads, loading, initialLoading, isReachingEnd]);
}
