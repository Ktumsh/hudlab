"use client";

import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

import type { CollectionWithFullDetails } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoverSelectorProps {
  collection: CollectionWithFullDetails;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

const CoverSelector = ({
  collection,
  isOpen,
  onClose,
  onSelect,
}: CoverSelectorProps) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  // Obtener todas las imágenes de los uploads en la colección
  const availableImages = collection.items.flatMap((item) =>
    item.upload.images.map((image) => ({
      id: image.id,
      url: image.imageUrl,
      uploadTitle: item.upload.title,
    })),
  );

  const handleSelect = () => {
    if (selectedImageUrl) {
      onSelect(selectedImageUrl);
      setSelectedImageUrl("");
    }
  };

  const handleClose = () => {
    setSelectedImageUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Seleccionar portada</DialogTitle>
          <DialogDescription>
            Elige una imagen de los uploads en tu colección para usar como
            portada
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {availableImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                No hay imágenes disponibles en esta colección
              </p>
              <p className="text-muted-foreground text-sm">
                Agrega algunos uploads para poder seleccionar una portada
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-1 sm:grid-cols-3 md:grid-cols-4">
              {availableImages.map((image) => (
                <div
                  key={image.id}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImageUrl === image.url
                      ? "border-primary shadow-lg"
                      : "hover:border-muted-foreground border-transparent"
                  }`}
                  onClick={() => setSelectedImageUrl(image.url)}
                >
                  <div className="aspect-square">
                    <Image
                      src={image.url}
                      alt={`Imagen de ${image.uploadTitle}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  {/* Overlay con título del upload */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="truncate text-xs text-white">
                      {image.uploadTitle}
                    </p>
                  </div>

                  {/* Indicador de selección */}
                  {selectedImageUrl === image.url && (
                    <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-2">
                        <IconCheck className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSelect} disabled={!selectedImageUrl}>
            Seleccionar portada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoverSelector;
