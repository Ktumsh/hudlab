"use client";

import useSWR from "swr";

import { fetcher } from "@/lib";

import type { UploadWithDetails } from "@/lib/types";

export function useAllUploads() {
  const { data = [], isLoading } = useSWR<UploadWithDetails[]>(
    `/api/all-uploads`,
    fetcher,
  );

  return {
    uploads: data,
    isLoading,
  };
}
