"use client";

import useSWR from "swr";

import { fetcher } from "@/lib";
import { FilterOptions } from "@/lib/types";

export function useFilterOptions() {
  const {
    data: filterOptions = {
      platforms: [],
      releaseYears: [],
    },
    isLoading,
    error,
  } = useSWR<FilterOptions>("/api/filter-options", fetcher);

  return { filterOptions, isLoading, error };
}
