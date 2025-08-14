"use client";

import { IconLock, IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import CollectionItemActions from "./collection-item-actions";
import CollectionRoleIndicator from "./collection-role-indicator";
import { Button } from "../ui/button";

import type {
  CollectionInvitation,
  CollectionPreview,
  CollectionPreviewWithDetails,
  UploadImage,
} from "@/lib/types";

import CreateCollectionForm from "@/components/collections/create-collection-form";
import { useIsMobile } from "@/hooks/use-mobile";

interface CollectionItemProps {
  collection?: CollectionPreview | CollectionPreviewWithDetails;
  showEditButton?: boolean;
  isSelf?: boolean;
  isInvitation?: boolean;
  collectionInvitation?: CollectionInvitation;
  children?: React.ReactNode;
}

const CollectionItem = ({
  collection,
  showEditButton = false,
  isSelf = false,
  isInvitation = false,
  collectionInvitation,
  children,
}: CollectionItemProps) => {
  const isMobile = useIsMobile();

  const voidSpace = <div className="bg-base-300 aspect-square size-full" />;

  if (isSelf) {
    return (
      <div>
        <CreateCollectionForm>
          <div className="group rounded-box relative overflow-hidden">
            <div className="flex h-4/5 gap-0.5">
              <div className="w-2/3">{voidSpace}</div>
              <div className="flex w-1/3 flex-col gap-0.5">
                {voidSpace}
                {voidSpace}
              </div>
            </div>
            <div className="from-base-100 absolute inset-0 bg-radial from-20% to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="from-base-100 absolute inset-0 grid place-content-center">
              <Button variant="neutral" size={isMobile ? "sm" : "default"}>
                <IconPlus />
                Crear colección
              </Button>
            </div>
          </div>
        </CreateCollectionForm>
        <div className="text-base-content/60 text-xs">
          <div className="flex items-center gap-3">
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  if (isInvitation && collectionInvitation) {
    const collection = collectionInvitation.collection;
    const grantedBy = collectionInvitation.grantedBy;
    return (
      <div>
        <div className="group rounded-box relative overflow-hidden">
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
              {voidSpace}
              {voidSpace}
            </div>
          </div>
        </div>
        <div className="p-2 md:p-3">
          <h3 className="line-clamp-1 text-sm font-semibold md:mb-1 md:text-base">
            {collection.name}
          </h3>
          <p className="text-content-muted text-xs md:text-sm">
            {grantedBy.displayName || grantedBy.username} te ha invitado a
            colaborar en esta colección
          </p>
        </div>
        {children}
      </div>
    );
  }

  if (!collection) return null;

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

      <div className="p-2 md:p-3">
        <h3 className="line-clamp-1 text-sm font-semibold md:mb-1 md:text-base">
          {collection.name}
        </h3>
        <div className="text-content-muted text-xxs md:text-xs">
          <div className="flex items-center gap-3">
            <span>{collection._count?.items || 0} HUDs</span>
            <span>{collection._count?.followers || 0} seguidores</span>
          </div>
        </div>
        {/* Mostrar indicador de rol solo si tenemos datos de permisos */}
        {"permissions" in collection &&
          collection.permissions &&
          collection.permissions.length > 0 && (
            <CollectionRoleIndicator
              collection={collection as CollectionPreviewWithDetails}
            />
          )}
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
