"use client";

import { IconArrowLeft, IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import CollectionActions from "./collection-actions";
import CollectionCollabInfo from "./collection-collab-info";
import CollectionFollowersDialog from "./collection-followers-dialog";
import CollectionRoleIndicator from "./collection-role-indicator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { BetterTooltip } from "../ui/tooltip";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { useCollectionRole } from "@/hooks/profile/use-collection-role";
import { useIsMobile } from "@/hooks/use-mobile";
import useOptimisticSWRMutation from "@/hooks/use-optimistic-swr-mutation";
import { useUser } from "@/hooks/use-user";

interface CollectionHeaderProps {
  collection?: CollectionPreviewWithDetails;
  isLoading: boolean;
}

const CollectionHeader = ({ collection, isLoading }: CollectionHeaderProps) => {
  const { user } = useUser();
  const { isOwner, isCollaborator, canEdit } = useCollectionRole(collection);

  const isMobile = useIsMobile();

  const router = useRouter();

  // Estado para el seguimiento
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Sincronizar con los datos de la colección cuando cambien
  useEffect(() => {
    if (collection && user && !isOwner) {
      const isFollowing =
        collection.followers?.some(
          (follower) => follower.followerId === user.profile.id,
        ) ?? false;
      setFollowing(isFollowing);
    } else {
      setFollowing(false);
    }
    setFollowersCount(collection?.followersCount || 0);
  }, [collection, user, isOwner]);

  const { run: runToggleFollow, isMutating } = useOptimisticSWRMutation<{
    success: boolean;
    isFollowing: boolean;
    followersCount: number;
  }>("/api/collections/toggle-follow", {
    getBody: () => ({ collectionId: collection?.id }),
    onError: (err) => {
      toast.error(err.message || "Error al seguir/dejar de seguir");
    },
  });

  const handleToggleFollow = async () => {
    const prevFollowing = following;
    const prevFollowers = followersCount;
    const optimisticFollowing = !prevFollowing;
    const optimisticFollowers = Math.max(
      0,
      prevFollowers + (optimisticFollowing ? 1 : -1),
    );
    setFollowing(optimisticFollowing);
    setFollowersCount(optimisticFollowers);

    try {
      const res = await runToggleFollow();
      if (res.success) {
        setFollowing(res.isFollowing);
        setFollowersCount(res.followersCount);
        toast.success(
          res.isFollowing
            ? "Ahora sigues esta colección"
            : "Ya no sigues esta colección",
        );
      } else {
        setFollowing(prevFollowing);
        setFollowersCount(prevFollowers);
        toast.error("Error al seguir/dejar de seguir");
      }
    } catch (err) {
      setFollowing(prevFollowing);
      setFollowersCount(prevFollowers);
      toast.error(
        err instanceof Error ? err.message : "Error al seguir/dejar de seguir",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="mt-14 flex items-center px-4 pt-4 pb-10 md:mt-0 md:pt-6">
        <div className="relative mx-auto w-full max-w-2xl space-y-6">
          {/* Back button skeleton - solo en desktop */}
          <div className="absolute top-0 -left-16 hidden md:block">
            <Skeleton className="size-12 rounded-full" />
          </div>

          <div className="space-y-2">
            {/* Header con título y acciones */}
            <div className="flex items-center justify-between gap-4">
              {/* Título */}
              <Skeleton className="h-9 w-64 max-w-full" />
              {/* Acciones en desktop */}
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="size-9" />
                </div>
              )}
            </div>

            {/* Badges/indicadores */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>

            {/* Stats (HUDs y seguidores) */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>

            {/* Descripción - solo en desktop */}
            <div className="hidden space-y-2 md:block">
              <Skeleton className="h-4 w-full max-w-prose" />
              <Skeleton className="h-4 w-3/4 max-w-prose" />
            </div>
          </div>

          {/* Información de colaboradores */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>

          {/* Acciones en mobile */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const showFollowButton = user && !isOwner;

  return (
    <div className="mt-14 flex items-center px-4 pt-4 pb-10 md:mt-0 md:pt-6">
      <div className="relative mx-auto w-full max-w-2xl space-y-6">
        <div className="absolute top-0 -left-16 hidden md:block">
          <Button variant="ghost" size="icon-lg" onClick={() => router.back()}>
            <IconArrowLeft className="size-6!" />
            <span className="sr-only">Volver</span>
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h1
              title={collection?.name}
              className="text-neutral-content truncate text-3xl font-bold"
            >
              {collection?.name}
            </h1>
            {!isMobile && (
              <CollectionActions
                collection={collection}
                showFollowButton={showFollowButton}
                isOwner={isOwner}
                canEdit={canEdit}
                following={following}
                isMutating={isMutating}
                handleToggleFollow={handleToggleFollow}
              />
            )}
          </div>
          {(isOwner ||
            isCollaborator ||
            collection?.visibility === "private") && (
            <div className="flex items-center gap-2">
              {collection?.visibility === "private" && (
                <BetterTooltip content="Colección privada">
                  <Badge className="bg-neutral text-neutral-content size-7 border-0 px-0">
                    <IconLock className="size-5!" />
                  </Badge>
                </BetterTooltip>
              )}
              <CollectionRoleIndicator
                collection={collection}
                showAvatars={false}
              />
            </div>
          )}
          <div className="text-content-muted flex items-center gap-3 text-sm">
            <span>
              <strong className="text-base-content">
                {collection?.itemsCount || 0}
              </strong>{" "}
              HUDs
            </span>
            {/* Seguidores clickeables */}
            {collection?.id && followersCount > 0 ? (
              <CollectionFollowersDialog
                collectionId={collection.id}
                followersCount={followersCount}
              >
                <span className="cursor-pointer hover:underline">
                  <strong className="text-base-content">
                    {followersCount}
                  </strong>{" "}
                  seguidores
                </span>
              </CollectionFollowersDialog>
            ) : (
              <span>
                <strong className="text-base-content">{followersCount}</strong>{" "}
                seguidores
              </span>
            )}
          </div>
          {collection?.description && (
            <p className="hidden max-w-prose text-sm text-pretty md:block">
              {collection.description}
            </p>
          )}
        </div>
        <CollectionCollabInfo collection={collection} />
        {isMobile && (
          <CollectionActions
            collection={collection}
            showFollowButton={showFollowButton}
            isOwner={isOwner}
            canEdit={canEdit}
            following={following}
            isMutating={isMutating}
            handleToggleFollow={handleToggleFollow}
          />
        )}
      </div>
    </div>
  );
};

export default CollectionHeader;
