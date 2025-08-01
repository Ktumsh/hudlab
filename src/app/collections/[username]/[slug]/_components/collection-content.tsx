"use client";

import { IconFolderOpen } from "@tabler/icons-react";
import { Masonry } from "masonic";
import { useState } from "react";

import type { CollectionWithFullDetails } from "@/lib/types";

import UploadCard from "@/app/feed/_components/upload-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface CollectionContentProps {
  collection: CollectionWithFullDetails;
  canEdit: boolean;
}

const CollectionContent = ({ collection, canEdit }: CollectionContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  // Filtrar items basado en el término de búsqueda
  const filteredItems = collection.items.filter((item) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    const upload = item.upload;

    return (
      upload.title.toLowerCase().includes(searchLower) ||
      upload.description?.toLowerCase().includes(searchLower) ||
      upload.game?.name?.toLowerCase().includes(searchLower) ||
      upload.tags?.toLowerCase().includes(searchLower)
    );
  });

  // Transformar para Masonry con aspectRatio
  const masonryItems = filteredItems.map((item) => ({
    id: item.id,
    upload: {
      ...item.upload,
      aspectRatio: "aspect-auto", // o calcular basado en las imágenes
    },
  }));

  if (collection.items.length === 0) {
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
      {collection.items.length > 0 && (
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
            {filteredItems.length} de {collection.items.length} items
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
        <Masonry
          items={masonryItems}
          columnWidth={isMobile ? 160 : 240}
          columnGutter={isMobile ? 4 : 20}
          render={({ data }) => <UploadCard upload={data.upload} />}
        />
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
