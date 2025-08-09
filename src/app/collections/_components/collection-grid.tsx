import CollectionItem from "./collection-item";

import type { CollectionPreview } from "@/lib/types";

import { cn } from "@/lib";

interface CollectionGridProps {
  collections: CollectionPreview[];
  className?: string;
  showEditButton?: boolean;
}

const CollectionGrid = ({
  collections,
  className,
  showEditButton = false,
}: CollectionGridProps) => {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7",
        className,
      )}
    >
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
