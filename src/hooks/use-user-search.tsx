"use client";

import useSWR from "swr";

import { fetcher } from "@/lib";

import type { UserSearchResult } from "@/lib/types";

export function useUserSearch(query: string) {
  const shouldFetch = query.trim().length > 0;

  const {
    data: users = [],
    error,
    isLoading,
  } = useSWR<UserSearchResult[]>(
    shouldFetch
      ? `/api/search-users?q=${encodeURIComponent(query.trim())}&limit=8`
      : null,
    fetcher,
    {
      // Configuración ultra-optimizada para velocidad máxima
      dedupingInterval: 1000, // 1s deduplicación
      focusThrottleInterval: 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
      errorRetryInterval: 0,
      keepPreviousData: true,
      // Configuración para velocidad extrema
      revalidateOnMount: true,
      refreshInterval: 0, // Sin refresh automático
    },
  );

  return {
    users,
    isLoading,
    error: error?.message || null,
  };
}
