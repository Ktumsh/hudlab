"use client";

import useSWR from "swr";

import { fetcher } from "@/lib";

import type { UploadWithDetails } from "@/lib/types";

export function useUploadSearch(query: string) {
  const shouldFetch = query.trim().length >= 2;

  const {
    data: uploads = [],
    error,
    isLoading,
  } = useSWR<UploadWithDetails[]>(
    shouldFetch
      ? `/api/search-uploads?q=${encodeURIComponent(query.trim())}&limit=12`
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
    uploads,
    isLoading,
    error: error?.message || null,
  };
}
