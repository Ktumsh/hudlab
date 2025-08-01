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

import EditCollectionForm from "./edit-collection-form";

import type { CollectionWithFullDetails } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BetterTooltip } from "@/components/ui/tooltip";
import { useApiMutation } from "@/lib/use-mutation";

interface CollectionActionsProps {
  collection: CollectionWithFullDetails;
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
  const [showEditForm, setShowEditForm] = useState(false);

  const toggleFollowMutation = useApiMutation(
    "/api/collections/toggle-follow",
    "POST",
  );

  const handleToggleFollow = async () => {
    // Actualización optimista
    const newFollowing = !following;
    const newFollowersCount = newFollowing
      ? followersCount + 1
      : followersCount - 1;

    setFollowing(newFollowing);
    setFollowersCount(newFollowersCount);

    try {
      const result = (await toggleFollowMutation.mutateAsync({
        collectionId: collection.id,
      })) as {
        success: boolean;
        isFollowing?: boolean;
        followersCount?: number;
        error?: string;
      };

      if (result.success) {
        setFollowing(result.isFollowing ?? false);
        setFollowersCount(result.followersCount ?? 0);
        toast.success(
          result.isFollowing
            ? "Ahora sigues esta colección"
            : "Ya no sigues esta colección",
        );
      } else {
        // Revertir en caso de error
        setFollowing(following);
        setFollowersCount(followersCount);
        toast.error(result.error || "Error al seguir/dejar de seguir");
      }
    } catch (error) {
      // Revertir en caso de error
      setFollowing(following);
      setFollowersCount(followersCount);
      console.error("Error toggling follow:", error);
      toast.error("Error inesperado");
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
          {!canEdit && (
            <BetterTooltip
              content={following ? "Dejar de seguir" : "Seguir colección"}
            >
              <Button
                variant={following ? "primary" : "secondary"}
                onClick={handleToggleFollow}
                disabled={toggleFollowMutation.isLoading}
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
              <IconShare className="h-4 w-4" />
            </Button>
          </BetterTooltip>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de editar (solo para propietarios/editores) */}
          {canEdit && (
            <BetterTooltip content="Editar colección">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditForm(true)}
              >
                <IconEdit className="h-4 w-4" />
              </Button>
            </BetterTooltip>
          )}

          {/* Menú de opciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <IconShare className="mr-2 h-4 w-4" />
                Compartir
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                    <IconEdit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modal de edición */}
      <EditCollectionForm
        collection={collection}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
      />
    </>
  );
};

export default CollectionActions;
