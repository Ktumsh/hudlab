"use client";

import {
  IconPhotoEdit,
  IconSparkles,
  IconArrowLeft,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import type { FilterSettings } from "@/hooks/use-image-filters";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselThumbnails,
  CarouselThumbnail,
  type CarouselApi,
} from "@/components/ui/carousel";
import { DialogFooter } from "@/components/ui/dialog";
import ImageEditor from "@/components/upload/editor/image-editor";
import { LocalImage } from "@/hooks/uploads/use-local-images";
import { DEFAULT_FILTERS } from "@/hooks/use-image-filters";
import { cn } from "@/lib";

interface ReviewStepProps {
  localImages: LocalImage[];
  onUpdateImage: (
    index: number,
    editedBlob: Blob,
    filters: FilterSettings,
    crop?: {
      aspectRatio?: number;
      crop?: { x: number; y: number; width: number; height: number };
    },
  ) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ReviewStep({
  localImages,
  onUpdateImage,
  onNext,
  onPrevious,
}: ReviewStepProps) {
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null,
  );
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const handleImageEdit = useCallback((index: number) => {
    setEditingImageIndex(index);
  }, []);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (api) {
        api.scrollTo(index);
      }
    },
    [api],
  );

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  const handleSaveEdit = useCallback(
    async (
      editedImageUrl: string,
      filters: FilterSettings,
      crop?: {
        aspectRatio?: number;
        crop?: { x: number; y: number; width: number; height: number };
      },
    ) => {
      if (editingImageIndex === null) return;

      const prev = localImages[editingImageIndex];

      const normalizeFilters = (fs?: FilterSettings) => {
        if (!fs) return {} as Partial<FilterSettings>;
        const out: Partial<FilterSettings> = {};
        (Object.keys(DEFAULT_FILTERS) as Array<keyof FilterSettings>).forEach(
          (key) => {
            const defVal = DEFAULT_FILTERS[key] as unknown as number;
            const v = (fs[key] as unknown as number | undefined) ?? defVal;
            if (v !== defVal) {
              // @ts-expect-error index assignment within Partial
              out[key] = v;
            }
          },
        );
        // Mantener colorMatrix si existe
        if (Array.isArray(fs.colorMatrix) && fs.colorMatrix.length === 20) {
          out.colorMatrix = [...fs.colorMatrix];
        }
        return out;
      };

      const normalizeCrop = (c?: {
        aspectRatio?: number;
        crop?: { x: number; y: number; width: number; height: number };
      }) => {
        if (!c) return undefined;
        const hasAspect = typeof c.aspectRatio === "number";
        const hasCrop = !!(
          c.crop &&
          typeof c.crop.x === "number" &&
          typeof c.crop.y === "number" &&
          typeof c.crop.width === "number" &&
          typeof c.crop.height === "number"
        );
        if (!hasAspect && !hasCrop) return undefined;
        const out: typeof c = {};
        if (hasAspect) out.aspectRatio = c.aspectRatio;
        if (hasCrop && c.crop) {
          const { x, y, width, height } = c.crop;
          out.crop = { x, y, width, height };
        }
        return out;
      };

      const prevF = normalizeFilters(
        prev.editFilters as FilterSettings | undefined,
      );
      const newF = normalizeFilters(filters);
      const prevC = normalizeCrop(prev.editCrop);
      const newC = normalizeCrop(crop);

      const sameFilters = JSON.stringify(prevF) === JSON.stringify(newF);
      const sameCrop = JSON.stringify(prevC) === JSON.stringify(newC);

      // Si no hay cambios reales, salir sin marcar como editada
      if (sameFilters && sameCrop) {
        setEditingImageIndex(null);
        return;
      }

      try {
        const res = await fetch(editedImageUrl);
        if (!res.ok) throw new Error("Failed to fetch edited image");
        const blob = await res.blob();
        onUpdateImage(editingImageIndex, blob, filters, crop);
        setEditingImageIndex(null);
      } catch {
        toast.error("Error al procesar la imagen editada");
      }
    },
    [editingImageIndex, localImages, onUpdateImage],
  );

  // Si estamos editando una imagen, mostrar el editor
  if (editingImageIndex !== null && localImages[editingImageIndex]) {
    return (
      <ImageEditor
        imageUrl={
          localImages[editingImageIndex].originalUrl ||
          localImages[editingImageIndex].url
        }
        initialFilters={localImages[editingImageIndex].editFilters}
        initialAspectRatio={
          localImages[editingImageIndex].editCrop?.aspectRatio
        }
        initialCrop={localImages[editingImageIndex].editCrop?.crop}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <>
      <div className="space-y-6 overflow-hidden">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: localImages.length > 1,
          }}
          orientation="horizontal"
        >
          <CarouselContent>
            {localImages.map((image, index) => (
              <CarouselItem
                key={image.id}
                className="relative"
                onClick={() => handleImageEdit(index)}
              >
                <div className="group relative">
                  <Image
                    src={image.url}
                    alt={`Imagen ${index + 1}`}
                    width={800}
                    height={400}
                    className="rounded-box bg-base-200 h-96 w-full object-contain"
                  />

                  <div className="rounded-box absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="lg"
                      onClick={() => handleImageEdit(index)}
                      className="bg-base-100/80 hover:bg-base-100/60"
                    >
                      <IconPhotoEdit className="size-5" />
                      Editar imagen
                    </Button>
                  </div>

                  {image.editedBlob && (
                    <div className="absolute top-3 right-3">
                      <Badge className="border-primary text-primary text-xs">
                        <IconSparkles /> Editada
                      </Badge>
                    </div>
                  )}

                  {index === 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="primary"
                        className="text-xs font-semibold"
                      >
                        Principal
                      </Badge>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {localImages.length > 1 && (
            <>
              <CarouselPrevious className="bg-base-100 left-4" />
              <CarouselNext className="bg-base-100 right-4" />
            </>
          )}
        </Carousel>

        {localImages.length > 1 && (
          <CarouselThumbnails>
            {localImages.map((image, index) => (
              <CarouselThumbnail
                key={image.id}
                isActive={index === current}
                onClick={() => goToSlide(index)}
                className={cn("size-12", image.editedBlob && "opacity-100")}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  width={64}
                  height={64}
                  className="aspect-square object-cover"
                />
                {image.editedBlob && (
                  <div className="bg-base-100/50 absolute inset-0 grid place-content-center">
                    <IconSparkles className="text-primary fill-primary size-7" />
                  </div>
                )}
              </CarouselThumbnail>
            ))}
          </CarouselThumbnails>
        )}
      </div>
      <DialogFooter className="sm:justify-between">
        <Button type="button" size="icon-lg" onClick={onPrevious}>
          <IconArrowLeft className="size-5" />
          <span className="sr-only">Atrás</span>
        </Button>
        <Button type="button" variant="primary" onClick={onNext}>
          Siguiente
        </Button>
      </DialogFooter>
    </>
  );
}
