import useSWR from "swr";

import type { PendingInvitation } from "@/lib/types";

import { fetcher } from "@/lib/fetcher";

export function usePendingInvitations(collectionId: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    invitations: PendingInvitation[];
  }>(`/api/collections/${collectionId}/pending-invitations`, fetcher);

  return {
    pendingInvitations: data?.invitations || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
