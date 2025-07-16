"use client";

import { useMemo, useRef } from "react";

import type {
  UploadWithDetails,
  UploadWithProfileAndAspect,
} from "@/lib/types";

const aspectRatios = [
  "aspect-3/4",
  "aspect-4/5",
  "aspect-2/3",
  "aspect-10/9",
  "aspect-1/1",
  "aspect-9/16",
];

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
  const lastCount = useRef(0);

  const totalExpected =
    uploads.length + (loading || initialLoading || !isReachingEnd ? limit : 0);

  if (totalExpected > lastCount.current) {
    lastCount.current = totalExpected;
  }

  return useMemo(() => {
    const items: GalleryItem[] = [];

    for (let i = 0; i < lastCount.current; i++) {
      const upload = uploads[i];

      if (upload) {
        if (!aspectRatioMap.current.has(upload.id)) {
          const ratio =
            aspectRatios[aspectRatioMap.current.size % aspectRatios.length];
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
