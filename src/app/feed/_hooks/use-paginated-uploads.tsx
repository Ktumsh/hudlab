"use client";

import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";

import { fetcher } from "@/lib";

import type { UploadWithDetails, FilterState } from "@/lib/types";

type UploadsResponse = {
  uploads: UploadWithDetails[];
  nextCursor: string | null;
};

const limit = 8;

export function usePaginatedUploads(
  filters: FilterState,
  initialData?: {
    uploads: UploadWithDetails[];
    nextCursor: string | null;
  },
) {
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
      fallbackData: initialData ? [initialData] : undefined,
    });

  const previousQueryRef = useRef(queryString);
  const previousUploadsRef = useRef<UploadWithDetails[]>([]);

  if (previousQueryRef.current !== queryString) {
    previousUploadsRef.current = [];
    previousQueryRef.current = queryString;
  }

  useEffect(() => {
    setSize(1);
  }, [queryString, setSize]);

  const uploads = data?.flatMap((page) => page.uploads) ?? [];

  if (uploads.length >= previousUploadsRef.current.length) {
    previousUploadsRef.current = uploads;
  }

  const stableUploads = previousUploadsRef.current;

  const isLoadingInitial = !data && !error;
  const isLoadingMore = isValidating && !!data && data.length > 0;
  const isReachingEnd = data?.[data.length - 1]?.nextCursor === null;

  return {
    uploads: stableUploads,
    isLoadingInitial,
    isLoadingMore,
    isReachingEnd,
    limit,
    loadMore: () => setSize(size + 1),
    error,
  };
}
