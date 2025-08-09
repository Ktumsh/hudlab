"use client";

import { useEffect } from "react";
import useSWRInfinite from "swr/infinite";

import type { UploadWithDetails } from "@/lib/types";

import { fetcher } from "@/lib";

type UploadsResponse = {
  uploads: UploadWithDetails[];
  nextCursor: string | null;
};

// Ya no usamos aspect ratios aleatorios

const limit = 8;

export function usePaginatedRelatedUploads({
  gameId,
  tags,
  excludeId,
}: {
  gameId: string;
  tags: string;
  excludeId: string;
}) {
  const queryString = new URLSearchParams({
    limit: limit.toString(),
    gameId,
    tags,
    excludeId,
  }).toString();

  const getKey = (_: number, previousPageData: UploadsResponse | null) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    const cursor = previousPageData?.nextCursor;
    let url = `/api/related-uploads?gameId=${gameId}&tags=${tags}&excludeId=${excludeId}`;
    if (cursor) url += `&cursor=${cursor}`;
    return url;
  };

  const { data, size, setSize, isValidating, error } =
    useSWRInfinite<UploadsResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
    });

  useEffect(() => {
    setSize(1);
  }, [queryString, setSize]);

  const rawUploads = data?.flatMap((page) => page.uploads) ?? [];
  const uploads: UploadWithDetails[] = rawUploads;

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
