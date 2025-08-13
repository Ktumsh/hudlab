"use client";

import { IconPencil } from "@tabler/icons-react";

import EditCollectionForm from "./edit-collection-form";

import type {
  CollectionPreview,
  CollectionPreviewWithDetails,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import { useCollectionRole } from "@/hooks/profile/use-collection-role";

interface CollectionItemActionsProps {
  collection: CollectionPreview | CollectionPreviewWithDetails;
}

const CollectionItemActions = ({ collection }: CollectionItemActionsProps) => {
  const { canEdit } = useCollectionRole(
    "permissions" in collection ? collection : undefined,
  );

  // Si no tiene permisos de edición, no mostrar botones
  if (!canEdit) {
    return null;
  }

  // Solo mostrar botón de edición si es CollectionPreviewWithDetails
  if (!("permissions" in collection)) {
    return null;
  }

  return (
    <div className="bg-base-100/50 absolute inset-0 flex items-end justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
      <EditCollectionForm collection={collection}>
        <Button variant="primary" size="icon">
          <IconPencil />
        </Button>
      </EditCollectionForm>
    </div>
  );
};

export default CollectionItemActions;
