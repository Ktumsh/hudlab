"use client";

import useSWR from "swr";

import type { CollectionPreview } from "@/lib/types";

import { fetcher } from "@/lib";

export function useProfileCollections(username: string) {
  const {
    data: collections,
    isLoading,
    error,
  } = useSWR<CollectionPreview[]>(
    `/api/users/${username}/collections`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return { collections, isLoading, error };
}
