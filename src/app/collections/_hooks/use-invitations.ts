"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import type { CollectionInvitation } from "@/lib/types";

import { fetcher } from "@/lib";
import { apiPost } from "@/lib/fetcher";

export function useInvitations() {
  const { data, isLoading, error, mutate } = useSWR<{
    invitations: CollectionInvitation[];
  }>("/api/collections/invitations", fetcher);

  // Estados locales para manejar loading independiente por invitación
  const [loadingStates, setLoadingStates] = useState<{
    accepting: Set<string>;
    rejecting: Set<string>;
  }>({
    accepting: new Set(),
    rejecting: new Set(),
  });

  const { trigger: triggerAccept } = useSWRMutation(
    "/api/collections/invitations/accept",
    async (_url, { arg }: { arg: { permissionId: string } }) =>
      apiPost<{ success: boolean }>("/api/collections/invitations/accept", {
        body: arg,
      }),
  );
  const { trigger: triggerReject } = useSWRMutation(
    "/api/collections/invitations/reject",
    async (_url, { arg }: { arg: { permissionId: string } }) =>
      apiPost<{ success: boolean }>("/api/collections/invitations/reject", {
        body: arg,
      }),
  );

  const accept = async (permissionId: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      accepting: new Set([...prev.accepting, permissionId]),
    }));

    try {
      const res = await triggerAccept({ permissionId });
      if (res.success) await mutate();
      return res;
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        accepting: new Set(
          [...prev.accepting].filter((id) => id !== permissionId),
        ),
      }));
    }
  };

  const reject = async (permissionId: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      rejecting: new Set([...prev.rejecting, permissionId]),
    }));

    try {
      const res = await triggerReject({ permissionId });
      if (res.success) await mutate();
      return res;
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        rejecting: new Set(
          [...prev.rejecting].filter((id) => id !== permissionId),
        ),
      }));
    }
  };

  return {
    invitations: data?.invitations ?? [],
    isLoading,
    error,
    refresh: mutate,
    accept,
    reject,
    // Funciones helper para verificar loading de invitaciones específicas
    isAccepting: (permissionId: string) =>
      loadingStates.accepting.has(permissionId),
    isRejecting: (permissionId: string) =>
      loadingStates.rejecting.has(permissionId),
  };
}
