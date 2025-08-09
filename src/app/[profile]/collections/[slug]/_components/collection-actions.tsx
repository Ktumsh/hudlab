"use client";

import {
  IconHeart,
  IconHeartFilled,
  IconEdit,
  IconShare,
  IconDots,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import type { CollectionPreview } from "@/lib/types";

import EditCollectionForm from "@/app/collections/_components/edit-collection-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BetterTooltip } from "@/components/ui/tooltip";
import useOptimisticSWRMutation from "@/hooks/use-optimistic-swr-mutation";
// apiUrl ya abstraído en postJson

interface CollectionActionsProps {
  collection: CollectionPreview;
  canEdit: boolean;
  isFollowing: boolean;
}

const CollectionActions = ({
  collection,
  canEdit,
  isFollowing,
}: CollectionActionsProps) => {
  const [following, setFollowing] = useState(isFollowing);
  const [followersCount, setFollowersCount] = useState(
    collection.followersCount || 0,
  );

  const { run: runToggleFollow, isMutating } = useOptimisticSWRMutation<{
    success: boolean;
    isFollowing: boolean;
    followersCount: number;
  }>("/api/collections/toggle-follow", {
    getBody: () => ({ collectionId: collection.id }),
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: collection.name,
          text: collection.description || "",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing collection:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Enlace copiado al portapapeles");
      } catch (error) {
        console.error("Error copying link:", error);
        toast.error("Error al copiar enlace");
      }
    }
  };

  return (
    <>
      <div className="border-base-300 mb-8 flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-2">
          {/* Botón de seguir - solo si no puede editar la colección */}
          {canEdit && (
            <BetterTooltip
              content={following ? "Dejar de seguir" : "Seguir colección"}
            >
              <Button
                variant={following ? "primary" : "secondary"}
                onClick={handleToggleFollow}
                disabled={isMutating}
                className="gap-2"
              >
                {following ? (
                  <IconHeartFilled className="h-4 w-4" />
                ) : (
                  <IconHeart className="h-4 w-4" />
                )}
                {following ? "Siguiendo" : "Seguir"}
                <span className="text-sm">({followersCount})</span>
              </Button>
            </BetterTooltip>
          )}

          {/* Botón de compartir */}
          <BetterTooltip content="Compartir">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <IconShare />
            </Button>
          </BetterTooltip>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <BetterTooltip content="Editar colección">
              <EditCollectionForm collection={collection}>
                <Button variant="ghost" size="icon">
                  <IconEdit />
                </Button>
              </EditCollectionForm>
            </BetterTooltip>
          )}

          {/* Menú de opciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDots />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <IconShare />
                Compartir
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <EditCollectionForm collection={collection}>
                    <DropdownMenuItem>
                      <IconEdit />
                      Editar
                    </DropdownMenuItem>
                  </EditCollectionForm>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default CollectionActions;
