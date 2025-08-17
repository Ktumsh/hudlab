"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconX,
  IconPhotoFilled,
  IconCircleArrowUpFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { Badge } from "../ui/badge";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib";

interface UploadedImage {
  url: string;
  file: File;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
}

interface UploadDropzoneProps {
  uploadedImages: UploadedImage[];
  isUploading: boolean;
  onFilesSelected: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
}

export default function UploadDropzone({
  uploadedImages,
  isUploading,
  onFilesSelected,
  onRemoveImage,
  onReorder,
  maxFiles = 5,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
  },
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      maxFiles: maxFiles - uploadedImages.length,
      disabled: isUploading || uploadedImages.length >= maxFiles,
      multiple: true,
    });

  const isDisabled = isUploading || uploadedImages.length >= maxFiles;

  // dnd-kit sensors (touch + pointer)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

  // Mapear IDs estables para dnd
  const itemIds = uploadedImages.map((img, idx) => `${idx}`);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onReorder || isUploading) return;
    const { active, over } = event;
    if (!over) return;
    const from = itemIds.indexOf(String(active.id));
    const to = itemIds.indexOf(String(over.id));
    if (from !== to && from !== -1 && to !== -1) {
      onReorder(from, to);
    }
  };

  // Item sortable
  function SortableThumb({
    id,
    index,
    image,
  }: {
    id: string;
    index: number;
    image: UploadedImage;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
      opacity: isDragging ? 0.8 : 1,
    } as React.CSSProperties;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group rounded-box relative"
        {...attributes}
        {...listeners}
      >
        <Image
          src={image.url}
          alt={`HUD ${index + 1}`}
          width={100}
          height={100}
          className="aspect-square w-full object-cover select-none"
          draggable={false}
        />

        <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon-sm"
            onClick={() => onRemoveImage(index)}
            className="bg-base-100/50 border-0"
          >
            <IconX />
          </Button>
        </div>

        {index === 0 && (
          <Badge
            size="sm"
            variant="primary"
            className="absolute inset-x-0 -bottom-3 mx-auto text-xs font-semibold"
          >
            Principal
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={cn(
          "rounded-box grid h-52 cursor-pointer place-content-center border-2 border-dashed px-8 text-center transition-colors",
          isDragActive && !isDragReject
            ? "border-primary bg-primary/10"
            : isDragReject
              ? "border-error bg-error/10"
              : isDisabled
                ? "border-base-300 bg-base-200 cursor-not-allowed"
                : "border-base-300 hover:border-primary hover:bg-base-200",
        )}
      >
        <input {...getInputProps()} accept="image/jpeg,image/png,image/webp" />

        <div className="flex flex-col space-y-4">
          <div className="relative mx-auto">
            <IconPhotoFilled
              className={cn(
                "text-content-muted mx-auto size-12",
                isDragActive && "text-primary",
              )}
            />
            <div className="bg-base-100 absolute -right-4 -bottom-1 rounded-full p-px">
              <IconCircleArrowUpFilled className="text-primary size-7" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-content-muted mt-1">
              {isDragActive
                ? "Suelta las imágenes aquí..."
                : isDragReject
                  ? "Tipo de archivo no válido"
                  : isDisabled
                    ? `Máximo ${maxFiles} imágenes`
                    : "Clickea para subir o arrastra y suelta"}
            </p>
            <p className="text-base-content/40 text-xs">
              Formatos soportados: JPEG, PNG, WEBP (máximo 5MB cada una)
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {uploadedImages.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {uploadedImages.map((image, index) => (
                <SortableThumb
                  key={itemIds[index]}
                  id={itemIds[index]}
                  index={index}
                  image={image}
                />
              ))}
              {Array.from(
                { length: maxFiles - uploadedImages.length },
                (_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="rounded-box bg-base-200 size-full border-2 border-dashed"
                  />
                ),
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
