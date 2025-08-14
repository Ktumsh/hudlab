"use client";

import useSWR from "swr";

import { fetcher } from "@/lib";

interface FollowerUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isFollowing?: boolean;
}

export function useFollowersData(username: string) {
  const { data, isLoading, error, mutate } = useSWR<FollowerUser[]>(
    username ? `/api/users/${username}/followers` : null,
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
    mutate,
  };
}
