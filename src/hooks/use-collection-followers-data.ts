"use client";

import useSWR from "swr";

import { fetcher } from "@/lib";

interface CollectionFollower {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export function useCollectionFollowersData(collectionId: string) {
  const { data, isLoading, error } = useSWR<CollectionFollower[]>(
    collectionId ? `/api/collections/${collectionId}/followers` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    followers: data || [],
    isLoading,
    error,
  };
}
