"use client";

import { IconCrown, IconStar, IconUsers } from "@tabler/icons-react";

import { BetterTooltip } from "../ui/tooltip";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserAvatar from "@/components/user-avatar";
import { useCollectionRole } from "@/hooks/profile/use-collection-role";
import { cn } from "@/lib";

interface CollectionRoleIndicatorProps {
  collection: CollectionPreviewWithDetails;
}

const roleIcons = {
  owner: IconCrown,
  admin: IconStar,
  designer: IconUsers,
  view: IconUsers,
  none: IconUsers,
};

const roleLabels = {
  owner: "Propietario",
  admin: "Administrador",
  designer: "Diseñador",
  view: "Visualizador",
  none: "Sin permisos",
};

const roleTextColors = {
  owner: "text-amber-500",
  admin: "text-purple-500",
  designer: "text-blue-500",
  view: "text-gray-500",
  none: "text-gray-400",
};

const roleBackgroundColors = {
  owner: "bg-amber-500/20",
  admin: "bg-purple-500/20",
  designer: "bg-blue-500/20",
  view: "bg-gray-500/20",
  none: "bg-gray-400/20",
};

const CollectionRoleIndicator = ({
  collection,
}: CollectionRoleIndicatorProps) => {
  const { role, isOwner, isCollaborator } = useCollectionRole(collection);

  if (!isOwner && !isCollaborator) {
    return null; // No mostrar nada si no tiene rol
  }

  const Icon = roleIcons[role];
  const label = roleLabels[role];
  const colorClass = roleTextColors[role];
  const backgroundClass = roleBackgroundColors[role];

  return (
    <div className="mt-1 flex items-center justify-between gap-2">
      {/* Mostrar avatar stack de colaboradores */}
      <div className="avatar-group -ms-1 -space-x-2 overflow-visible">
        {/* Propietario */}
        <UserAvatar
          profile={collection.profile}
          className="avatar size-6 border-3"
        />

        {/* Colaboradores (máximo 3 + contador) */}
        {collection.permissions
          ?.filter((p) => p.status !== "pending")
          ?.slice(0, 3)
          ?.map((permission) => (
            <UserAvatar
              key={permission.profileId}
              profile={permission.profile}
              className="avatar size-6 border-3"
            />
          ))}

        {/* Contador si hay más colaboradores */}
        {(collection.permissions?.filter((p) => p.status !== "pending")
          ?.length || 0) > 3 && (
          <Avatar className="avatar size-6">
            <AvatarFallback className="text-xs">
              +
              {(collection.permissions?.filter((p) => p.status !== "pending")
                ?.length || 0) - 3}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <BetterTooltip
        content={
          role === "owner"
            ? "Eres el propietario"
            : `Permisos de ${label.toLocaleLowerCase()}`
        }
      >
        <div
          className={cn(
            "rounded-box grid size-6 place-content-center",
            backgroundClass,
          )}
        >
          <Icon className={cn("size-4", colorClass)} />
        </div>
      </BetterTooltip>
    </div>
  );
};

export default CollectionRoleIndicator;
