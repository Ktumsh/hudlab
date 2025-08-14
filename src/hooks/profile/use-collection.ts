"use client";

import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

import type {
  CollectionPreviewWithDetails,
  UploadWithDetails,
} from "@/lib/types";

import { fetcher } from "@/lib";

interface CollectionUploadsResponse {
  uploads: UploadWithDetails[];
  nextCursor: string | null;
}

interface UseCollectionOptions {
  withInfiniteUploads?: boolean;
}

export function useCollection(
  username: string,
  slug: string,
  options: UseCollectionOptions = {},
) {
  const { withInfiniteUploads = false } = options;

  // Hook para obtener datos básicos de la colección
  const { data, error, isLoading, mutate } = useSWR<{
    collection: CollectionPreviewWithDetails;
  }>(
    username && slug ? `/api/users/${username}/collections/${slug}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  // Hook para infinite scroll de uploads (opcional)
  const getKey = (index: number, prev: CollectionUploadsResponse | null) => {
    if (!withInfiniteUploads || !username || !slug) return null;
    if (prev && !prev.nextCursor) return null;

    const limit = index === 0 ? 30 : 20;
    const cursor = prev?.nextCursor;
    const queryString = new URLSearchParams({ limit: String(limit) });
    if (cursor) queryString.set("cursor", cursor);

    return `/api/users/${username}/collections/${slug}/uploads?${queryString.toString()}`;
  };

  const infiniteResult = useSWRInfinite<CollectionUploadsResponse>(
    withInfiniteUploads ? getKey : () => null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (withInfiniteUploads) {
    const uploads = infiniteResult.data?.flatMap((p) => p.uploads) ?? [];
    const isLoadingInitial = !infiniteResult.data && !infiniteResult.error;
    const isLoadingMore =
      infiniteResult.isValidating &&
      !!infiniteResult.data &&
      infiniteResult.data.length > 0;
    const isReachingEnd =
      infiniteResult.data?.[infiniteResult.data.length - 1]?.nextCursor ===
      null;

    return {
      collection: data?.collection,
      uploads,
      isLoading,
      isLoadingInitial,
      isLoadingMore,
      isReachingEnd,
      error: error || infiniteResult.error,
      refresh: mutate,
      loadMore: () => infiniteResult.setSize(infiniteResult.size + 1),
    };
  }

  return {
    collection: data?.collection,
    isLoading,
    error,
    refresh: mutate,
  };
}
