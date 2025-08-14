"use client";

import useSWR from "swr";

import type { CollectionPreview } from "@/lib/types";

import { fetcher } from "@/lib";

interface FollowedUser {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPrivate: boolean;
  followedAt: Date | string;
  isFollowing?: boolean;
}

export function useFollowingData(username: string, isOwn: boolean) {
  // Usuarios seguidos
  const {
    data: usersData,
    isLoading: loadingUsers,
    mutate: mutateUsers,
  } = useSWR<{
    users: FollowedUser[];
  }>(username ? `/api/users/${username}/following` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Colecciones seguidas (solo si es el perfil propio)
  const {
    data: collectionsData,
    isLoading: loadingCollections,
    mutate: mutateCollections,
  } = useSWR<CollectionPreview[]>(
    isOwn ? "/api/collections/followed" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    followedUsers: usersData?.users ?? [],
    followedCollections: collectionsData ?? [],
    isLoadingUsers: loadingUsers,
    isLoadingCollections: loadingCollections,
    mutateUsers,
    mutateCollections,
  };
}
