"use client";

import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { CollectionPreview } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib";

interface CoverSelectorProps {
  collection: CollectionPreview;
  isOpen: boolean;
  onClose: () => void;
  initialSelected: string;
  onSelect: (imageUrl: string) => void;
}

const CoverSelector = ({
  collection,
  isOpen,
  onClose,
  initialSelected,
  onSelect,
}: CoverSelectorProps) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setSelectedImageUrl(initialSelected);
    }
  }, [initialSelected, isOpen]);

  const availableImages = collection.previewUploads.flatMap((item) =>
    item.images.map((image) => ({
      id: image.id,
      url: image.imageUrl,
      uploadTitle: item.title,
    })),
  );

  const handleSelect = () => {
    if (selectedImageUrl) {
      onSelect(selectedImageUrl);
      setSelectedImageUrl("");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-4xl"
      >
        <DialogHeader>
          <DialogTitle>Seleccionar portada</DialogTitle>
          <DialogDescription>
            Elige una imagen de los HUDs en tu colección para usar como portada
          </DialogDescription>
        </DialogHeader>

        <div className="">
          {availableImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                No hay imágenes disponibles en esta colección
              </p>
              <p className="text-muted-foreground text-sm">
                Agrega algunos HUDs para poder seleccionar una portada
              </p>
            </div>
          ) : (
            <div className="columns-[156px] gap-4">
              {availableImages.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "group rounded-box relative mb-4 cursor-pointer overflow-hidden",
                    selectedImageUrl === image.url &&
                      "outline-primary outline-2 outline-offset-2",
                  )}
                  onClick={() => setSelectedImageUrl(image.url)}
                >
                  <div className="bg-base-100/50 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <Image
                    src={image.url}
                    alt={`Imagen de ${image.uploadTitle}`}
                    width={300}
                    height={300}
                    className="h-full object-cover"
                  />
                  {/* Indicador de selección */}
                  {selectedImageUrl === image.url && (
                    <div className="absolute right-2 bottom-2">
                      <div className="bg-primary text-primary-content grid size-6 place-content-center rounded-full">
                        <IconCheck className="size-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="primary"
            disabled={!selectedImageUrl}
            onClick={handleSelect}
          >
            Guardar selección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CoverSelector;
