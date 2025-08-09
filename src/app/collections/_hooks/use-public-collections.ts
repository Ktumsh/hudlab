"use client";

import useSWR from "swr";

import type { CollectionPreview } from "@/lib/types";

import { fetcher } from "@/lib";

export function usePublicCollections(limit = 24) {
  const key = `/api/public-collections?limit=${limit}`;
  const {
    data = [],
    isLoading,
    error,
    mutate,
  } = useSWR<CollectionPreview[]>(key, fetcher, { fallbackData: [] });

  return { publicCollections: data, isLoading, error, refresh: mutate };
}
