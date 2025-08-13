"use client";

import { IconCrown, IconStar, IconUsers } from "@tabler/icons-react";

import { Badge } from "../ui/badge";
import { BetterTooltip } from "../ui/tooltip";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserAvatar from "@/components/user-avatar";
import { useCollectionRole } from "@/hooks/profile/use-collection-role";
import { cn } from "@/lib";

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

interface CollectionRoleIndicatorProps {
  collection?: CollectionPreviewWithDetails;
  showAvatars?: boolean;
}

const CollectionRoleIndicator = ({
  collection,
  showAvatars = true,
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
    <div
      className={cn(
        "mt-1 flex items-center justify-between gap-2",
        !showAvatars && "mt-0",
      )}
    >
      {/* Mostrar avatar stack de colaboradores */}
      {showAvatars && (
        <div className="avatar-group -ms-1 -space-x-2 overflow-visible">
          {/* Propietario */}
          <UserAvatar
            title={collection?.profile.displayName}
            profile={collection?.profile}
            className="avatar size-6 border-3 transition-transform hover:-translate-y-0.5"
          />

          {/* Colaboradores (máximo 3 + contador) */}
          {collection?.permissions
            ?.filter((p) => p.status !== "pending")
            ?.slice(0, 3)
            ?.map((permission) => (
              <UserAvatar
                key={permission.profileId}
                title={permission.profile.displayName}
                profile={permission.profile}
                className="avatar size-6 border-3 transition-transform hover:-translate-y-0.5"
              />
            ))}

          {/* Contador si hay más colaboradores */}
          {(collection?.permissions?.filter((p) => p.status !== "pending")
            ?.length || 0) > 3 && (
            <Avatar
              title={`+${
                (collection?.permissions?.filter((p) => p.status !== "pending")
                  ?.length || 0) - 3
              } colaboradores`}
              className="avatar size-6 border-3 transition-transform hover:-translate-y-0.5"
            >
              <AvatarFallback className="text-xxs font-medium">
                +
                {(collection?.permissions?.filter((p) => p.status !== "pending")
                  ?.length || 0) - 3}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
      <BetterTooltip
        content={
          role === "owner"
            ? "Eres el propietario"
            : `Permisos de ${label.toLocaleLowerCase()}`
        }
      >
        <Badge
          className={cn("size-7 border-0 px-0", backgroundClass, colorClass)}
        >
          <Icon className={cn("size-4", !showAvatars && "size-5!")} />
        </Badge>
      </BetterTooltip>
    </div>
  );
};

export default CollectionRoleIndicator;
