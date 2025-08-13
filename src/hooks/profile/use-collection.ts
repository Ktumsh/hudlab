"use client";

import useSWR from "swr";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { fetcher } from "@/lib";

export function useCollection(username: string, slug: string) {
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

  return {
    collection: data?.collection,
    isLoading,
    error,
    refresh: mutate,
  };
}
