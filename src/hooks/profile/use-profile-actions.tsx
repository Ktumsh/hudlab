"use client";

import { toast } from "sonner";
import { mutate as globalMutate } from "swr";

import type { ProfileData } from "@/lib/types";
import type { KeyedMutator } from "swr";

import useOptimisticSWRMutation from "@/hooks/use-optimistic-swr-mutation";

interface useProfileActionsProps {
  username: string;
  mutate: KeyedMutator<ProfileData>;
}

export function useProfileActions({
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
            // Los followers del perfil cambian cuando YO lo sigo/dejo de seguir
            followers: prev.stats.followers + (prev.isFollowing ? -1 : 1),
          },
        };
      },
      reconcile: (server, current, rollback) => {
        if (!current || !rollback) return current;

        // Calcular la diferencia real basada en el estado del servidor
        const wasFollowing = rollback.isFollowing;
        const isNowFollowing = server.isFollowing;

        let followersDiff = 0;
        if (!wasFollowing && isNowFollowing) {
          followersDiff = 1; // Empecé a seguir
        } else if (wasFollowing && !isNowFollowing) {
          followersDiff = -1; // Dejé de seguir
        }

        return {
          ...current,
          isFollowing: server.isFollowing,
          stats: {
            ...current.stats,
            followers: rollback.stats.followers + followersDiff,
          },
        };
      },
      onError: (err) => {
        toast.error(err.message || "No se pudo actualizar el seguimiento");
      },
    });

  const toggleFollow = async (): Promise<void> => {
    const result = await runToggleFollow();

    // Actualizar los caches después de la acción
    if (result?.success) {
      // Revalidar las listas de seguidores y seguidos para el usuario del perfil
      await Promise.all([
        // Lista de seguidores del usuario del perfil
        globalMutate(`/api/users/${username}/followers`),
        // Lista de seguidos del usuario del perfil
        globalMutate(`/api/users/${username}/following`),
        // Revalidar todos los caches de following y profiles para refrescar las listas
        globalMutate(
          (key: string) =>
            key.includes("/following") ||
            key.includes("/followers") ||
            key.includes("/profile"),
        ),
      ]);
    }
  };

  return { toggleFollow, isToggling };
}
