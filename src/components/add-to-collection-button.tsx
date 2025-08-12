"use client";

import {
  IconCheck,
  IconLock,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconStarOff,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import CreateCollectionForm from "../app/me/collections/_components/create-collection-form";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { BetterTooltip } from "@/components/ui/tooltip";
import { useCollectionsInteractions } from "@/hooks/use-collections-interactions";
import { useUser } from "@/hooks/use-user";
import { useUserCollections } from "@/hooks/use-user-collections";
import { cn } from "@/lib";

interface AddToCollectionButtonProps {
  uploadId: string;
  className?: string;
  variant?: "card" | "details";
}

const AddToCollectionButton = ({
  uploadId,
  className,
  variant = "card",
}: AddToCollectionButtonProps) => {
  const { user } = useUser();
  const pathname = usePathname();

  const {
    getCollectionsForUpload,
    isLoading: isInitialLoading,
    refreshCollections,
    updateOptimisticCollectionStatus,
  } = useUserCollections();

  const userCollections = getCollectionsForUpload(uploadId);

  const { handleToggleCollection } = useCollectionsInteractions({
    uploadId,
    onOptimisticUpdate: (collectionId, hasUpload) =>
      updateOptimisticCollectionStatus(collectionId, uploadId, hasUpload),
    onRefresh: refreshCollections,
  });

  const hasInCollections = Array.isArray(userCollections)
    ? userCollections.some((col) => col.hasUpload)
    : false;

  const getButtonProps = (): {
    variant: "default" | "primary";
    size: "icon" | "icon-lg";
    className: string[];
  } => {
    if (variant === "details") {
      return {
        variant: hasInCollections ? "primary" : "default",
        size: "icon-lg",
        className: className ? [className] : [],
      };
    }

    return {
      variant: "default",
      size: "icon",
      className: [
        "bg-base-100/70 transition duration-150 hover:scale-105",
        ...(hasInCollections
          ? ["bg-primary text-primary-content border-primary"]
          : []),
        ...(className ? [className] : []),
      ],
    };
  };

  const buttonProps = getButtonProps();

  return (
    <Popover>
      <BetterTooltip content="Agregar a colección">
        <PopoverTrigger asChild>
          <Button
            variant={buttonProps.variant}
            size={buttonProps.size}
            className={cn("pointer-events-auto z-10", buttonProps.className)}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {hasInCollections ? (
              <IconStarFilled
                className={variant === "details" ? "size-6" : "size-4"}
              />
            ) : (
              <IconStar
                className={variant === "details" ? "size-6" : "size-4"}
              />
            )}
          </Button>
        </PopoverTrigger>
      </BetterTooltip>
      <PopoverContent
        className="p-0 sm:max-w-xs sm:min-w-xs"
        align="end"
        sideOffset={8}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          {user && (
            <h3 className="mb-4 text-lg font-semibold">Añadir a colección</h3>
          )}
          <div className="space-y-4">
            <div className="space-y-4">
              {!user ? (
                <div className="py-3 text-center">
                  <div className="mb-3">
                    <IconStarOff className="text-base-content/40 mx-auto size-10" />
                  </div>
                  <p className="text-content-muted mb-4 text-pretty">
                    Necesitas una cuenta para guardar este HUD en una colección.
                  </p>
                  <div className="space-x-2">
                    <Button asChild>
                      <Link href={`/auth/login?next=${pathname}`}>
                        Iniciar sesión
                      </Link>
                    </Button>
                    <Button asChild variant="primary">
                      <Link href={`/auth/login?next=${pathname}`}>
                        Registrarse
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : isInitialLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="rounded-box flex items-center gap-3 border p-3"
                    >
                      <Skeleton className="size-4 rounded" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userCollections.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mb-4">
                    <IconStar className="text-base-content/40 mx-auto size-10" />
                  </div>
                  <p className="text-content-muted mb-4">
                    Aún no tienes colecciones
                  </p>
                  <CreateCollectionForm>
                    <Button>Crear mi primera colección</Button>
                  </CreateCollectionForm>
                </div>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {userCollections.length > 0 &&
                    userCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="hover:bg-base-200 rounded-field flex cursor-pointer items-center gap-3 border border-transparent p-2"
                        onClick={() =>
                          handleToggleCollection(
                            collection.id,
                            collection.hasUpload,
                          )
                        }
                      >
                        <div className="bg-neutral flex size-10 shrink-0 items-center justify-center rounded-md">
                          {collection.coverImageUrl && (
                            <Image
                              src={collection.coverImageUrl}
                              alt={collection.name}
                              width={40}
                              height={40}
                              className="aspect-square h-full rounded-md object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">
                              {collection.name}
                            </p>
                            {collection.visibility === "private" && (
                              <IconLock className="size-4" />
                            )}
                            {collection.hasUpload && (
                              <IconCheck className="text-success ms-auto size-5" />
                            )}
                          </div>
                          {collection.description && (
                            <p className="text-base-content/70 line-clamp-1 text-sm">
                              {collection.description}
                            </p>
                          )}
                          <p className="text-content-muted text-xs">
                            {collection.itemsCount || 0} items
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {userCollections.length > 0 && (
                <div className="border-t pt-4">
                  <CreateCollectionForm>
                    <Button variant="primary" wide>
                      <IconPlus />
                      Crear nueva colección
                    </Button>
                  </CreateCollectionForm>
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddToCollectionButton;
