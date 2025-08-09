"use client";

import { IconFolderOpen } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MasonryGrid = dynamic(
  () => import("@/app/feed/_components/masonry-grid"),
  {
    ssr: false,
  },
);

interface CollectionContentProps {
  collection: CollectionPreviewWithDetails;
  canEdit: boolean;
}

const CollectionContent = ({ collection, canEdit }: CollectionContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar items basado en el término de búsqueda
  const filteredItems = collection.previewUploads.filter((upload) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();

    return (
      upload.title.toLowerCase().includes(searchLower) ||
      upload.description?.toLowerCase().includes(searchLower) ||
      upload.game?.name?.toLowerCase().includes(searchLower) ||
      upload.tags?.toLowerCase().includes(searchLower)
    );
  });

  if (collection.previewUploads.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="bg-base-200 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <IconFolderOpen className="text-base-content/40 h-12 w-12" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Colección vacía</h3>
        <p className="text-base-content/70 mb-6">
          {canEdit
            ? "Esta colección aún no tiene ningún upload. Comienza agregando tu primer item."
            : "Esta colección aún no tiene contenido."}
        </p>
        {canEdit && <Button>Explorar Uploads</Button>}
      </div>
    );
  }

  return (
    <div>
      {/* Barra de búsqueda */}
      {collection.previewUploads.length > 0 && (
        <div className="mb-6">
          <Input
            placeholder="Buscar en esta colección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      {/* Resultados de búsqueda */}
      {searchTerm && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base-content/70 text-sm">
            {filteredItems.length} de {collection.previewUploads.length} items
            {searchTerm && ` para "${searchTerm}"`}
          </p>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
              Limpiar filtro
            </Button>
          )}
        </div>
      )}

      {/* Grid de uploads */}
      {filteredItems.length > 0 ? (
        <MasonryGrid uploads={filteredItems} />
      ) : searchTerm ? (
        <div className="py-12 text-center">
          <p className="text-base-content/60">
            No se encontraron uploads que coincidan con &quote;{searchTerm}
            &quote;.
          </p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setSearchTerm("")}
          >
            Ver todos los items
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CollectionContent;
