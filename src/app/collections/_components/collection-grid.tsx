"use client";

import { IconBookmarks } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import type { CollectionPreview } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib";


interface CollectionGridProps {
  collections: CollectionPreview[];
  className?: string;
}

const CollectionGrid = ({ collections, className }: CollectionGridProps) => {
  if (collections.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-base-content/60">No hay colecciones para mostrar.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.profile.username}/${collection.slug}`}
          className="group"
        >
          <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-0">
              {/* Cover Image o Preview */}
              <div className="relative aspect-square">
                {collection.coverImageUrl ? (
                  <Image
                    src={collection.coverImageUrl}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : collection.previewUploads.length > 0 ? (
                  // Grid masonry-style como Pinterest
                  <div className="grid h-full w-full gap-0.5">
                    {collection.previewUploads.length === 1 ? (
                      // Caso de 1 imagen - ocupa todo el espacio
                      <div className="relative h-full w-full overflow-hidden rounded-sm">
                        {collection.previewUploads[0].images[0]?.imageUrl && (
                          <Image
                            src={
                              collection.previewUploads[0].images[0].imageUrl
                            }
                            alt={collection.previewUploads[0].title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                      </div>
                    ) : collection.previewUploads.length === 2 ? (
                      // Caso de 2 imágenes - división horizontal
                      <div className="grid h-full grid-cols-2 gap-0.5">
                        {collection.previewUploads.slice(0, 2).map((upload) => (
                          <div
                            key={upload.id}
                            className="relative overflow-hidden rounded-sm"
                          >
                            {upload.images[0]?.imageUrl && (
                              <Image
                                src={upload.images[0].imageUrl}
                                alt={upload.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : collection.previewUploads.length === 3 ? (
                      // Caso de 3 imágenes - 1 grande a la izquierda, 2 pequeñas a la derecha
                      <div className="grid h-full grid-cols-2 gap-0.5">
                        <div className="relative overflow-hidden rounded-sm">
                          {collection.previewUploads[0].images[0]?.imageUrl && (
                            <Image
                              src={
                                collection.previewUploads[0].images[0].imageUrl
                              }
                              alt={collection.previewUploads[0].title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                        </div>
                        <div className="grid grid-rows-2 gap-0.5">
                          <div className="relative overflow-hidden rounded-sm">
                            {collection.previewUploads[1].images[0]
                              ?.imageUrl && (
                              <Image
                                src={
                                  collection.previewUploads[1].images[0]
                                    .imageUrl
                                }
                                alt={collection.previewUploads[1].title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            )}
                          </div>
                          <div className="relative overflow-hidden rounded-sm">
                            {collection.previewUploads[2].images[0]
                              ?.imageUrl && (
                              <Image
                                src={
                                  collection.previewUploads[2].images[0]
                                    .imageUrl
                                }
                                alt={collection.previewUploads[2].title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Caso de 4+ imágenes - grid 2x2 con overlay para más
                      <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
                        {collection.previewUploads
                          .slice(0, 4)
                          .map((upload, index) => (
                            <div
                              key={upload.id}
                              className="relative overflow-hidden rounded-sm"
                            >
                              {upload.images[0]?.imageUrl && (
                                <Image
                                  src={upload.images[0].imageUrl}
                                  alt={upload.title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              )}
                              {/* Overlay para el último item si hay más de 4 */}
                              {index === 3 &&
                                collection.previewUploads.length > 4 && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-semibold text-white">
                                    +{collection.previewUploads.length - 4}
                                  </div>
                                )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-base-200 flex h-full items-center justify-center">
                    <IconBookmarks className="text-base-content/40 h-12 w-12" />
                  </div>
                )}

                {/* Badges de privacidad */}
                {collection.visibility !== "public" && (
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={
                        collection.visibility === "private"
                          ? "error"
                          : "secondary"
                      }
                    >
                      {collection.visibility === "private"
                        ? "Privada"
                        : "Restringida"}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="p-4">
                <h3 className="mb-1 line-clamp-1 font-semibold">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-base-content/70 mb-2 line-clamp-2 text-sm">
                    {collection.description}
                  </p>
                )}

                <div className="text-base-content/60 flex items-center justify-between text-xs">
                  <span>
                    {collection.profile.displayName ||
                      collection.profile.username}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{collection._count?.items || 0} items</span>
                    <span>{collection._count?.followers || 0} seguidores</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default CollectionGrid;
