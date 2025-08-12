"use client";

import { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import type {
  CollaboratorPermission,
  PendingInvitation,
  UserSearchResult,
} from "@/lib/types";

import { apiPost } from "@/lib/fetcher";

// Hook para invitar colaboradores con actualización optimista
export function useInviteCollaborator(collectionId: string) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/collections/${collectionId}/collaborators`,
    async (
      _url,
      {
        arg,
      }: {
        arg: {
          profileId: string;
          permission: CollaboratorPermission;
          userProfile?: UserSearchResult;
        };
      },
    ) => {
      return apiPost<{ success: boolean; error?: string }>(
        `/api/collections/${collectionId}/collaborators`,
        {
          body: { profileId: arg.profileId, permission: arg.permission },
          method: "POST",
        },
      );
    },
    {
      onSuccess: async () => {
        // Actualizar las invitaciones pendientes optimísticamente
        await mutate(`/api/collections/${collectionId}/pending-invitations`);
        // Actualizar las colecciones del perfil
        await mutate(
          (key) =>
            typeof key === "string" && key.includes("/profile/collections"),
        );
      },
    },
  );

  const inviteCollaboratorOptimistic = async (params: {
    profileId: string;
    permission: CollaboratorPermission;
    userProfile?: UserSearchResult;
  }) => {
    const pendingInvitationsKey = `/api/collections/${collectionId}/pending-invitations`;
    let rollbackData: { invitations: PendingInvitation[] } | undefined;

    // Actualización optimista inmediata
    if (params.userProfile) {
      await mutate(
        pendingInvitationsKey,
        (current: { invitations: PendingInvitation[] } | undefined) => {
          if (!current) return current;

          // Guardar datos originales para rollback
          rollbackData = { ...current };

          // Crear la invitación pendiente optimista
          const optimisticInvitation: PendingInvitation = {
            id: `temp-${params.profileId}-${Date.now()}`, // ID temporal
            profile: params.userProfile!,
            permission: params.permission,
            createdAt: new Date().toISOString(),
          };

          return {
            invitations: [...current.invitations, optimisticInvitation],
          };
        },
        { revalidate: false },
      );
    }

    try {
      // Ejecutar la mutación real
      const result = await trigger(params);
      return result;
    } catch (error) {
      // Rollback en caso de error
      if (rollbackData) {
        await mutate(pendingInvitationsKey, rollbackData, {
          revalidate: false,
        });
      }
      throw error;
    }
  };

  return {
    inviteCollaborator: inviteCollaboratorOptimistic,
    isInviting: isMutating,
  };
}

// Hook para eliminar colaboradores
export function useRemoveCollaborator(collectionId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/collections/${collectionId}/collaborators`,
    async (_url, { arg }: { arg: { profileId: string } }) => {
      return apiPost<{ success: boolean; error?: string }>(
        `/api/collections/${collectionId}/collaborators`,
        {
          body: arg,
          method: "DELETE",
        },
      );
    },
  );

  return {
    removeCollaborator: trigger,
    isRemoving: isMutating,
    error,
  };
}

// Hook para actualizar permisos de todos los colaboradores de la colección
export function useUpdateCollaboratorsPermission(collectionId: string) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/collections/${collectionId}/collaborators/permissions`,
    async (_url, { arg }: { arg: { permission: CollaboratorPermission } }) => {
      return apiPost<{
        success: boolean;
        error?: string;
        updatedCount?: number;
      }>(`/api/collections/${collectionId}/collaborators/permissions`, {
        body: arg,
        method: "PATCH",
      });
    },
    {
      onSuccess: async () => {
        // Actualizar las invitaciones pendientes
        await mutate(`/api/collections/${collectionId}/pending-invitations`);
        // Actualizar las colecciones del perfil
        await mutate(
          (key) =>
            typeof key === "string" && key.includes("/profile/collections"),
        );
      },
    },
  );

  const updateCollaboratorsPermissionOptimistic = async (params: {
    permission: CollaboratorPermission;
  }) => {
    const pendingInvitationsKey = `/api/collections/${collectionId}/pending-invitations`;
    let rollbackData: { invitations: PendingInvitation[] } | undefined;

    // Actualización optimista de invitaciones pendientes
    await mutate(
      pendingInvitationsKey,
      (current: { invitations: PendingInvitation[] } | undefined) => {
        if (!current) return current;

        // Guardar datos originales para rollback
        rollbackData = { ...current };

        // Actualizar permisos de todas las invitaciones pendientes
        return {
          invitations: current.invitations.map((invitation) => ({
            ...invitation,
            permission: params.permission,
          })),
        };
      },
      { revalidate: false },
    );

    // También actualizar colecciones del perfil optimísticamente
    await mutate(
      (key) => typeof key === "string" && key.includes("/profile/collections"),
      (
        data:
          | {
              collections?: Array<{
                id: string;
                permissions?: Array<{ permission: string }>;
              }>;
            }
          | undefined,
      ) => {
        if (!data?.collections) return data;

        return {
          ...data,
          collections: data.collections.map((collection) => {
            if (collection.id === collectionId) {
              return {
                ...collection,
                permissions: collection.permissions?.map((permission) => ({
                  ...permission,
                  permission: params.permission,
                })),
              };
            }
            return collection;
          }),
        };
      },
      { revalidate: false },
    );

    try {
      // Ejecutar la mutación real
      const result = await trigger(params);
      return result;
    } catch (error) {
      // Rollback en caso de error
      if (rollbackData) {
        await mutate(pendingInvitationsKey, rollbackData, {
          revalidate: false,
        });
      }
      throw error;
    }
  };

  return {
    updateCollaboratorsPermission: updateCollaboratorsPermissionOptimistic,
    isUpdating: isMutating,
  };
}
