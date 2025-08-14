"use client";

import CollectionOptions from "./collection-options";
import EditCollectionForm from "./edit-collection-form";
import { Button } from "../ui/button";
import { BetterTooltip } from "../ui/tooltip";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { useIsMobile } from "@/hooks/use-mobile";

interface CollectionActionsProps {
  collection?: CollectionPreviewWithDetails;
  showFollowButton?: boolean;
  isOwner: boolean;
  canEdit: boolean;
  following: boolean;
  isMutating: boolean;
  handleToggleFollow: () => void;
}

const CollectionActions = ({
  collection,
  showFollowButton,
  isOwner,
  canEdit,
  following,
  isMutating,
  handleToggleFollow,
}: CollectionActionsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-2">
      {showFollowButton && (
        <BetterTooltip content={following ? "Dejar de seguir" : "Seguir"}>
          <Button
            size={isMobile ? "sm" : "default"}
            variant={following ? "default" : "primary"}
            onClick={handleToggleFollow}
            disabled={isMutating}
            className="flex-1 md:flex-auto"
          >
            {following ? "Siguiendo" : "Seguir"}
          </Button>
        </BetterTooltip>
      )}
      {canEdit && collection && (
        <BetterTooltip content="Editar colección">
          <EditCollectionForm collection={collection}>
            <Button
              size={isMobile ? "sm" : "default"}
              className="flex-1 md:flex-auto"
            >
              Editar colección
            </Button>
          </EditCollectionForm>
        </BetterTooltip>
      )}
      <CollectionOptions
        isSelf={isOwner}
        collectionId={collection?.id || ""}
        collectionName={collection?.name || ""}
        collectionDescription={collection?.description || ""}
      />
    </div>
  );
};

export default CollectionActions;
