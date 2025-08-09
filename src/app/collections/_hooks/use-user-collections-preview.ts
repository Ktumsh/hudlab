"use client";

import useSWR from "swr";

import { useAuth } from "../../../hooks/use-auth";

import type { CollectionPreview } from "@/lib/types";

import { fetcher } from "@/lib";

export function useUserCollectionsPreview() {
  const { user } = useAuth();

  const {
    data = [],
    isLoading,
    error,
    mutate,
  } = useSWR<CollectionPreview[]>(
    user?.id ? `/api/user-collections/${user.id}` : null,
    fetcher,
    { fallbackData: [] },
  );

  return { userCollections: data, isLoading, error, refresh: mutate };
}
