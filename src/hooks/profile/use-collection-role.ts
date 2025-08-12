"use client";

import { useMemo } from "react";

import { useUser } from "../use-user";

import type {
  CollectionPreviewWithDetails,
  CollaboratorPermission,
} from "@/lib/types";

export type CollectionRole = "owner" | "admin" | "designer" | "view" | "none";

interface UseCollectionRoleReturn {
  role: CollectionRole;
  canView: boolean;
  canEdit: boolean; // Editar detalles de la colección
  canManageItems: boolean; // Agregar/quitar HUDs
  canManageCollaborators: boolean; // Invitar/remover colaboradores
  isOwner: boolean;
  isCollaborator: boolean;
}

export function useCollectionRole(
  collection: CollectionPreviewWithDetails | null | undefined,
): UseCollectionRoleReturn {
  const { user } = useUser();

  return useMemo(() => {
    if (!collection || !user) {
      return {
        role: "none",
        canView: collection?.visibility === "public",
        canEdit: false,
        canManageItems: false,
        canManageCollaborators: false,
        isOwner: false,
        isCollaborator: false,
      };
    }

    const userProfileId = user.profile.id;
    const isOwner = collection.profileId === userProfileId;

    // Si es el propietario, tiene todos los permisos
    if (isOwner) {
      return {
        role: "owner",
        canView: true,
        canEdit: true,
        canManageItems: true,
        canManageCollaborators: true,
        isOwner: true,
        isCollaborator: false,
      };
    }

    // Buscar permisos como colaborador
    const userPermission = collection.permissions?.find(
      (p) => p.profileId === userProfileId && p.status !== "pending",
    );

    if (!userPermission) {
      // Usuario no es colaborador, solo puede ver si es pública
      return {
        role: "none",
        canView: collection.visibility === "public",
        canEdit: false,
        canManageItems: false,
        canManageCollaborators: false,
        isOwner: false,
        isCollaborator: false,
      };
    }

    // Usuario es colaborador
    const permission = userPermission.permission as CollaboratorPermission;

    return {
      role: permission,
      canView: true, // Los colaboradores siempre pueden ver
      canEdit: permission === "admin", // Solo admins pueden editar detalles
      canManageItems: permission === "admin" || permission === "designer",
      canManageCollaborators: false, // Solo el propietario puede gestionar colaboradores
      isOwner: false,
      isCollaborator: true,
    };
  }, [collection, user]);
}
