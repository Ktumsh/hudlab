"use client";

import useSWR from "swr";

import type { CollectionPreview } from "@/lib/types";

import { useAuth } from "@/hooks/use-auth";
import { fetcher } from "@/lib";

export function useFollowedCollections() {
  const { user } = useAuth();

  const {
    data = [],
    isLoading,
    error,
    mutate,
  } = useSWR<CollectionPreview[]>(
    user ? "/api/collections/followed" : null,
    fetcher,
    { fallbackData: [] },
  );

  return { followed: data, isLoading, error, refresh: mutate };
}
