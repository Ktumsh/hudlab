"use client";

import { IconLock } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import CollectionItemActions from "./collection-item-actions";

import type { CollectionPreview, UploadImage } from "@/lib/types";

interface CollectionItemProps {
  collection: CollectionPreview;
  showEditButton?: boolean;
}

const CollectionItem = ({
  collection,
  showEditButton = false,
}: CollectionItemProps) => {
  const voidSpace = <div className="bg-base-300 aspect-square size-full" />;

  return (
    <Link
      key={collection.id}
      href={`/${collection.profile.username}/collections/${collection.slug}`}
      className="group"
    >
      <div className="rounded-box relative overflow-hidden">
        {showEditButton && <CollectionItemActions collection={collection} />}
        <div className="flex h-4/5 gap-0.5">
          <div className="w-2/3">
            {collection.coverImageUrl ? (
              <Image
                src={collection.coverImageUrl}
                alt={collection.name}
                width={300}
                height={300}
                className="aspect-square h-full object-cover"
              />
            ) : (
              voidSpace
            )}
          </div>
          <div className="flex w-1/3 flex-col gap-0.5">
            {collection.previewUploads[1]?.images[0] ? (
              <SquareGridItem image={collection.previewUploads[1].images[0]} />
            ) : (
              voidSpace
            )}
            {collection.previewUploads[2]?.images[0] ? (
              <SquareGridItem image={collection.previewUploads[2].images[0]} />
            ) : (
              voidSpace
            )}
          </div>
        </div>

        {collection.visibility !== "public" && (
          <div className="absolute top-2 left-2">
            <div className="bg-base-100 grid size-7 place-content-center rounded-full">
              <IconLock className="size-4" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="mb-1 line-clamp-1 font-semibold">{collection.name}</h3>
        {collection.description && (
          <p className="text-base-content/70 mb-2 line-clamp-2 text-sm">
            {collection.description}
          </p>
        )}

        <div className="text-base-content/60 text-xs">
          <div className="flex items-center gap-3">
            <span>{collection._count?.items || 0} HUDs</span>
            <span>{collection._count?.followers || 0} seguidores</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionItem;

const PureSquareGridItem = ({ image }: { image: UploadImage }) => (
  <div className="bg-base-200 aspect-square size-full">
    {image && (
      <Image
        src={image.imageUrl}
        alt={image.caption ?? ""}
        height={image.height}
        width={image.width}
        className="aspect-square object-cover"
      />
    )}
  </div>
);

const SquareGridItem = memo(PureSquareGridItem, (prevProps, nextProps) => {
  return prevProps.image.imageUrl === nextProps.image.imageUrl;
});
