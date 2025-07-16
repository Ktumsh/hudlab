"use client";

import { useEffect } from "react";
import useSWRInfinite from "swr/infinite";

import { fetcher } from "@/lib";

import type {
  UploadWithDetails,
  FilterState,
  UploadWithProfileAndAspect,
} from "@/lib/types";

type UploadsResponse = {
  uploads: UploadWithDetails[];
  nextCursor: string | null;
};

const aspectRatios = [
  "aspect-3/4",
  "aspect-4/5",
  "aspect-2/3",
  "aspect-10/9",
  "aspect-1/1",
  "aspect-9/16",
];

const limit = 20;

export function usePaginatedUploads(filters: FilterState) {
  const queryString = new URLSearchParams({
    limit: limit.toString(),
    searchText: filters.searchText || "",
    sortBy: filters.sortBy || "newest",
    platform: filters.platform || "",
    releaseYear: filters.releaseYear?.toString() || "",
    isFavorited: filters.isFavorited ? "1" : "",
    tags: filters.tags.join(",") || "",
  }).toString();

  const getKey = (_: number, previousPageData: UploadsResponse | null) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    const cursor = previousPageData?.nextCursor;
    return `/api/filtered-uploads?${queryString}${cursor ? `&cursor=${cursor}` : ""}`;
  };

  const { data, size, setSize, isValidating, error } =
    useSWRInfinite<UploadsResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
    });

  useEffect(() => {
    setSize(1);
  }, [queryString, setSize]);

  const rawUploads = data?.flatMap((page) => page.uploads) ?? [];

  const aspectRatioMap = new Map<string, string>();
  const uploads: UploadWithProfileAndAspect[] = rawUploads.map((upload) => {
    let fixed = aspectRatioMap.get(upload.id);
    if (!fixed) {
      fixed = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
      aspectRatioMap.set(upload.id, fixed);
    }
    return { ...upload, aspectRatio: fixed };
  });

  const isLoadingInitial = !data && !error;
  const isLoadingMore = isValidating && !!data && data.length > 0;
  const isReachingEnd = data?.[data.length - 1]?.nextCursor === null;

  return {
    uploads,
    isLoadingInitial,
    isLoadingMore,
    isReachingEnd,
    limit,
    loadMore: () => setSize(size + 1),
    error,
  };
}
