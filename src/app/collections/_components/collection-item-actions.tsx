"use client";

import { IconPencil } from "@tabler/icons-react";

import EditCollectionForm from "./edit-collection-form";

import type { CollectionPreview } from "@/lib/types";

import { Button } from "@/components/ui/button";

interface CollectionItemActionsProps {
  collection: CollectionPreview;
}

const CollectionItemActions = ({ collection }: CollectionItemActionsProps) => {
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
