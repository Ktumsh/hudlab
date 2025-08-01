"use client";

import useSWR from "swr";

import type { SearchSuggestion } from "@/lib/types";

import { fetcher } from "@/lib";

export function useSearchSuggestions() {
  const {
    data: searchSuggestions = [],
    isLoading,
    error,
  } = useSWR<SearchSuggestion[]>("/api/search-suggestions", fetcher);

  return { searchSuggestions, isLoading, error };
}
