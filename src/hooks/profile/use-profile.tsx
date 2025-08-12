"use client";

import useSWR from "swr";

import type { ProfileData } from "@/lib/types";

import { fetcher } from "@/lib";

interface useProfileProps {
  username: string;
  initialData: ProfileData | null;
}

export function useProfile({ username, initialData }: useProfileProps) {
  const key = `/api/users/${username}/profile`;

  const { data, isLoading, mutate } = useSWR<ProfileData>(key, fetcher, {
    fallbackData: initialData ?? undefined,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    data,
    isLoading,
    mutate,
  };
}
