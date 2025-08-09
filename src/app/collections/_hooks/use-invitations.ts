"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import type { CollectionInvitation } from "@/lib/types";

import { fetcher } from "@/lib";
import { apiPost } from "@/lib/fetcher";

export function useInvitations() {
  const { data, isLoading, error, mutate } = useSWR<{
    invitations: CollectionInvitation[];
  }>("/api/collections/invitations", fetcher);

  const { trigger: triggerAccept, isMutating: isAccepting } = useSWRMutation(
    "/api/collections/invitations/accept",
    async (_url, { arg }: { arg: { permissionId: string } }) =>
      apiPost<{ success: boolean }>("/api/collections/invitations/accept", {
        body: arg,
      }),
  );
  const { trigger: triggerReject, isMutating: isRejecting } = useSWRMutation(
    "/api/collections/invitations/reject",
    async (_url, { arg }: { arg: { permissionId: string } }) =>
      apiPost<{ success: boolean }>("/api/collections/invitations/reject", {
        body: arg,
      }),
  );

  const accept = async (permissionId: string) => {
    const res = await triggerAccept({ permissionId });
    if (res.success) await mutate();
    return res;
  };
  const reject = async (permissionId: string) => {
    const res = await triggerReject({ permissionId });
    if (res.success) await mutate();
    return res;
  };

  return {
    invitations: data?.invitations ?? [],
    isLoading,
    error,
    refresh: mutate,
    accept,
    reject,
    accepting: isAccepting,
    rejecting: isRejecting,
  };
}
