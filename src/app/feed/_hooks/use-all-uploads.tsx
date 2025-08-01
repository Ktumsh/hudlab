"use client";

import useSWR from "swr";

import type { UploadWithDetails } from "@/lib/types";

import { fetcher } from "@/lib";


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
