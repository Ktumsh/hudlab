"use client";

import useSWRInfinite from "swr/infinite";

import type { UploadWithDetails } from "@/lib/types";

import { fetcher } from "@/lib";

interface UploadsResponse {
  uploads: UploadWithDetails[];
  nextCursor: string | null;
}

export function useProfileUploads(username: string) {
  const getKey = (index: number, prev: UploadsResponse | null) => {
    if (prev && !prev.nextCursor) return null;
    const limit = index === 0 ? 30 : 10;
    const cursor = prev?.nextCursor;
    const queryString = new URLSearchParams({ limit: String(limit) });
    if (cursor) queryString.set("cursor", cursor);
    return `/api/users/${username}/uploads?${queryString.toString()}`;
  };

  const { data, size, setSize, isValidating, error } =
    useSWRInfinite<UploadsResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });

  const uploads = data?.flatMap((p) => p.uploads) ?? [];
  const isLoadingInitial = !data && !error;
  const isLoadingMore = isValidating && !!data && data.length > 0;
  const isReachingEnd = data?.[data.length - 1]?.nextCursor === null;

  return {
    uploads,
    isLoadingInitial,
    isLoadingMore,
    isReachingEnd,
    limit: 20,
    loadMore: () => setSize(size + 1),
    error,
  };
}
