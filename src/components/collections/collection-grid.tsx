"use client";

import CollectionItem from "./collection-item";

import type {
  CollectionPreview,
  CollectionPreviewWithDetails,
} from "@/lib/types";

import { useIsSelfProfile } from "@/hooks/use-is-self-profile";
import { cn } from "@/lib";

interface CollectionGridProps {
  collections: (CollectionPreview | CollectionPreviewWithDetails)[];
  className?: string;
  showEditButton?: boolean;
}

const CollectionGrid = ({
  collections,
  className,
  showEditButton = false,
}: CollectionGridProps) => {
  const isSelf = useIsSelfProfile();

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1 md:gap-4 lg:grid-cols-3 xl:grid-cols-7",
        className,
      )}
    >
      {isSelf && <CollectionItem isSelf={isSelf} />}
      {collections.map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          showEditButton={showEditButton}
        />
      ))}
    </div>
  );
};

export default CollectionGrid;
