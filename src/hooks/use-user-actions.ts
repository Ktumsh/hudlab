"use client";

import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import { apiDelete, apiPost } from "@/lib/fetcher";

// Hook con actualización optimista local para usar en listas
export function useUserFollow(username: string, initialFollowState?: boolean) {
  const [optimisticFollowState, setOptimisticFollowState] = useState<
    boolean | undefined
  >(initialFollowState);
  const [isOptimisticPending, setIsOptimisticPending] = useState(false);

  const endpoint = `/api/users/${username}/toggle-follow`;

  async function toggleFollowFetcher(
    url: string,
  ): Promise<{ success: boolean; isFollowing: boolean }> {
    return apiPost<{ success: boolean; isFollowing: boolean }>(url);
  }

  const { trigger, isMutating } = useSWRMutation(
    endpoint,
    toggleFollowFetcher,
    {
      onError: (err) => {
        toast.error(err.message || "No se pudo actualizar el seguimiento");
        // Revertir estado optimista en caso de error
        setOptimisticFollowState(initialFollowState);
        setIsOptimisticPending(false);
      },
    },
  );

  const toggleFollow = async () => {
    // Actualización optimista inmediata
    const currentState = optimisticFollowState ?? initialFollowState ?? false;
    const newOptimisticState = !currentState;

    setOptimisticFollowState(newOptimisticState);
    setIsOptimisticPending(true);

    const result = await trigger();

    if (result?.success) {
      // Actualizar con el estado real del servidor
      setOptimisticFollowState(result.isFollowing);

      // Revalidar los caches después de la acción
      await Promise.all([
        // Listas del usuario que se siguió/dejó de seguir
        mutate(
          (key) =>
            typeof key === "string" &&
            key.includes(`/api/users/${username}/followers`),
        ),
        mutate(
          (key) =>
            typeof key === "string" &&
            key.includes(`/api/users/${username}/following`),
        ),
        // Perfil del usuario que se siguió/dejó de seguir
        mutate(
          (key) =>
            typeof key === "string" &&
            key.includes(`/api/users/${username}/profile`),
        ),
        // Mi propia lista de seguidos
        mutate(
          (key) =>
            typeof key === "string" &&
            key.includes("/following") &&
            !key.includes(username),
        ),
        // Mi propio perfil (para actualizar stats)
        mutate(
          (key) =>
            typeof key === "string" &&
            key.includes("/profile") &&
            !key.includes(username),
        ),
      ]);
    }

    setIsOptimisticPending(false);
    return result;
  };

  return {
    toggleFollow,
    isToggling: isMutating,
    isFollowing: optimisticFollowState ?? initialFollowState ?? false,
    isOptimisticPending,
  };
}

export function useRemoveFollower(profileUsername: string) {
  const [isOptimisticRemoving, setIsOptimisticRemoving] = useState(false);

  async function deleteFollower(url: string, { arg }: { arg: string }) {
    return apiDelete<{ message: string }>(
      `/api/users/${profileUsername}/followers/${arg}`,
    );
  }

  const { trigger, isMutating } = useSWRMutation(
    `/api/users/${profileUsername}/followers`,
    deleteFollower,
    {
      onError: (err) => {
        toast.error(err.message || "No se pudo eliminar el seguidor");
        setIsOptimisticRemoving(false);
      },
      onSuccess: () => {
        toast.success("Seguidor eliminado");
        setIsOptimisticRemoving(false);
      },
    },
  );

  const removeFollower = async (followerUsername: string) => {
    // Actualización optimista
    setIsOptimisticRemoving(true);

    const result = await trigger(followerUsername);

    // Revalidar las listas después de eliminar
    if (result) {
      await Promise.all([
        // Lista de seguidores del perfil actual
        mutate(`/api/users/${profileUsername}/followers`),
        // Perfil del usuario actual (para actualizar stats)
        mutate(`/api/users/${profileUsername}/profile`),
        // Lista de seguidos del usuario eliminado (por si estaba siguiendo de vuelta)
        mutate(`/api/users/${followerUsername}/following`),
      ]);
    }

    return result;
  };

  return {
    removeFollower,
    isRemoving: isMutating || isOptimisticRemoving,
  };
}
