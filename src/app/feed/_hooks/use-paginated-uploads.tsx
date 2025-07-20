"use client";

import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";

import { fetcher } from "@/lib";

import type { UploadWithDetails, FilterState } from "@/lib/types";

type UploadsResponse = {
  uploads: UploadWithDetails[];
  nextCursor: string | null;
};

export function usePaginatedUploads(filters: FilterState) {
  const getKey = (
    pageIndex: number,
    previousPageData: UploadsResponse | null,
  ) => {
    if (previousPageData && !previousPageData.nextCursor) return null;

    const limit = pageIndex === 0 ? 20 : 10;
    const cursor = previousPageData?.nextCursor;

    const queryString = new URLSearchParams({
      limit: limit.toString(),
      searchText: filters.searchText || "",
      sortBy: filters.sortBy || "newest",
      platform: filters.platform || "",
      releaseYear: filters.releaseYear?.toString() || "",
      isFavorited: filters.isFavorited ? "1" : "",
      tags: filters.tags.join(",") || "",
    }).toString();

    return `/api/filtered-uploads?${queryString}${cursor ? `&cursor=${cursor}` : ""}`;
  };

  const { data, size, setSize, isValidating, error } =
    useSWRInfinite<UploadsResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    });

  const previousQueryRef = useRef("");
  const previousUploadsRef = useRef<UploadWithDetails[]>([]);

  // Generar una clave única para detectar cambios en filtros
  const currentQueryKey = JSON.stringify(filters);

  if (previousQueryRef.current !== currentQueryKey) {
    previousUploadsRef.current = [];
    previousQueryRef.current = currentQueryKey;
  }

  useEffect(() => {
    setSize(1);
  }, [currentQueryKey, setSize]);

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
    limit: 20, // Para mostrar que la primera carga es de 20
    loadMore: () => setSize(size + 1),
    error,
  };
}
