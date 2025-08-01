"use client";

import Image from "next/image";

import type { CollectionWithFullDetails } from "@/lib/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDisplayName } from "@/lib";

interface CollectionHeaderProps {
  collection: CollectionWithFullDetails;
}

const CollectionHeader = ({ collection }: CollectionHeaderProps) => {
  const displayName =
    collection.profile.displayName || collection.profile.username;

  return (
    <div className="mb-8">
      {/* Cover Image */}
      {collection.coverImageUrl && (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={collection.coverImageUrl}
            alt={collection.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {/* Título y descripción */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              {collection.visibility !== "public" && (
                <Badge
                  variant={
                    collection.visibility === "private" ? "error" : "secondary"
                  }
                >
                  {collection.visibility === "private"
                    ? "Privada"
                    : "Restringida"}
                </Badge>
              )}
            </div>

            {collection.description && (
              <p className="text-base-content/80 max-w-2xl leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          {/* Autor y estadísticas */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {collection.profile.avatarUrl ? (
                  <AvatarImage
                    src={collection.profile.avatarUrl}
                    alt={displayName}
                  />
                ) : (
                  <AvatarFallback>
                    {formatDisplayName(displayName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-base-content/70 text-sm">
                  @{collection.profile.username}
                </p>
              </div>
            </div>

            <div className="text-base-content/70 flex items-center gap-6 text-sm">
              <div>
                <span className="text-base-content font-semibold">
                  {collection.itemsCount || 0}
                </span>{" "}
                items
              </div>
              <div>
                <span className="text-base-content font-semibold">
                  {collection.followersCount || 0}
                </span>{" "}
                seguidores
              </div>
              <div>
                Creada{" "}
                {new Date(collection.createdAt || "").toLocaleDateString(
                  "es-ES",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionHeader;
