"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import type { ProfileData } from "@/lib/types";
import type { KeyedMutator } from "swr";

import useOptimisticSWRMutation from "@/hooks/use-optimistic-swr-mutation";

// (sin apiUrl: no se requiere aquí porque el hook genérico realiza el fetch interno)

interface useProfileActionsProps {
  displayName?: string;
  username: string;
  mutate: KeyedMutator<ProfileData>;
}

export function useProfileActions({
  displayName,
  username,
  mutate,
}: useProfileActionsProps) {
  const endpoint = `/api/users/${username}/toggle-follow`;

  const { run: runToggleFollow, isMutating: isToggling } =
    useOptimisticSWRMutation<
      { success: boolean; isFollowing: boolean },
      ProfileData
    >(endpoint, {
      externalMutate: mutate as unknown as (
        updater: (prev: ProfileData | undefined) => ProfileData | undefined,
        opts?: { revalidate?: boolean },
      ) => Promise<unknown>,
      buildOptimistic: (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isFollowing: !prev.isFollowing,
          stats: {
            ...prev.stats,
            followers: Math.max(
              0,
              prev.stats.followers + (prev.isFollowing ? -1 : 1),
            ),
          },
        };
      },
      reconcile: (server, current, rollback) => {
        if (!current || !rollback) return current;
        return {
          ...current,
          isFollowing: server.isFollowing,
          stats: {
            ...current.stats,
            followers: rollback.stats.followers + (server.isFollowing ? 1 : 0),
          },
        };
      },
      onError: (err) => {
        toast.error(err.message || "No se pudo actualizar el seguimiento");
      },
    });

  const [, copy] = useCopyToClipboard();

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/${username}`;
    return `${window.location.origin}/${username}`;
  }, [username]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          url: shareUrl,
          title: displayName || `@${username}`,
          text: `Mira el perfil de ${displayName ? displayName : `@${username}`} en HUDLab`,
        });
        return;
      }
      await copy(shareUrl);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("No se pudo compartir");
    }
  };

  const toggleFollow = async () => {
    await runToggleFollow();
  };

  return { toggleFollow, handleShare, isToggling };
}
