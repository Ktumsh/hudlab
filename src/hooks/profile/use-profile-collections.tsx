"use client";

import useSWR from "swr";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { fetcher } from "@/lib";

export function useProfileCollections(username: string) {
  const {
    data: collections,
    isLoading,
    error,
    mutate: refresh,
  } = useSWR<CollectionPreviewWithDetails[]>(
    `/api/users/${username}/collections`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return { collections, isLoading, error, refresh };
}
