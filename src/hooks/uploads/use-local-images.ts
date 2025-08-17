"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import type { FilterSettings } from "@/hooks/use-image-filters";

import { apiUpload } from "@/lib/fetcher";

export interface LocalImage {
  id: string;
  file: File;
  url: string; // Object URL para preview actual (puede ser editado)
  originalUrl: string; // Object URL del original (base para edición no destructiva)
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  editedBlob?: Blob; // Último resultado exportado (para preview/subida)
  editFilters?: FilterSettings; // Estado de filtros aplicado (no destructivo)
  editCrop?: {
    aspectRatio?: number;
    crop?: { x: number; y: number; width: number; height: number };
  };
}

export interface UploadedImage {
  url: string;
  caption?: string;
  width: number;
  height: number;
  format: string;
}

export function useLocalImages() {
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Agregar archivos localmente (sin subir a Cloudinary)
  const addFiles = useCallback((files: File[]) => {
    setLocalImages((prevImages) => {
      // Verificar límite de imágenes usando el estado previo
      if (prevImages.length + files.length > 5) {
        toast.error("No puedes agregar más de 5 imágenes");
        return prevImages; // Retornar el estado anterior sin cambios
      }

      const newImages: LocalImage[] = files
        .map((file) => {
          // Validar tipo de archivo
          const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
          ];
          if (!allowedTypes.includes(file.type)) {
            toast.error(`Tipo de archivo no válido: ${file.name}`);
            return null;
          }

          // Validar tamaño (máximo 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            toast.error(
              `El archivo ${file.name} es demasiado grande. Máximo 5MB`,
            );
            return null;
          }

          const objectUrl = URL.createObjectURL(file);
          return {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url: objectUrl,
            originalUrl: objectUrl,
            format: file.type.replace("image/", ""),
          };
        })
        .filter(Boolean) as LocalImage[];

      if (newImages.length > 0) {
        toast.success(
          `${newImages.length} imagen${newImages.length > 1 ? "es" : ""} agregada${newImages.length > 1 ? "s" : ""}`,
          { id: "add-files" },
        );
        return [...prevImages, ...newImages]; // Retornar el nuevo estado
      }

      return prevImages; // Si no hay nuevas imágenes, retornar el estado anterior
    });
  }, []); // Sin dependencias porque usamos el patrón funcional

  // Remover imagen local
  const removeImage = useCallback((index: number) => {
    setLocalImages((prev) => {
      const imageToRemove = prev[index];
      if (imageToRemove) {
        // Limpiar Object URL para liberar memoria
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Reordenar imágenes localmente (drag & drop)
  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    if (
      typeof fromIndex !== "number" ||
      typeof toIndex !== "number" ||
      fromIndex === toIndex
    )
      return;

    setLocalImages((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      )
        return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  // Actualizar imagen editada
  const updateEditedImage = useCallback(
    (
      index: number,
      editedBlob: Blob,
      filters: FilterSettings,
      crop?: {
        aspectRatio?: number;
        crop?: { x: number; y: number; width: number; height: number };
      },
    ) => {
      setLocalImages((prev) => {
        const updated = [...prev];
        const image = updated[index];
        if (image) {
          // Liberar URL anterior si existe
          if (image.editedBlob) {
            URL.revokeObjectURL(image.url);
          }

          updated[index] = {
            ...image,
            editedBlob,
            url: URL.createObjectURL(editedBlob),
            editFilters: filters,
            editCrop: crop,
          };
        }
        return updated;
      });
    },
    [],
  );

  // Subir todas las imágenes al backend (que a su vez usa Cloudinary)
  const uploadAllImages = useCallback(async (): Promise<UploadedImage[]> => {
    if (localImages.length === 0) {
      throw new Error("No hay imágenes para subir");
    }

    setIsProcessing(true);

    try {
      interface UploadImageResponse {
        success: boolean;
        image?: {
          url: string;
          webpUrl?: string;
          width: number;
          height: number;
          format: string;
        };
        error?: string;
        message?: string;
      }

      const results = await Promise.all(
        localImages.map(async (localImage, index) => {
          const fileToUpload = localImage.editedBlob || localImage.file;

          const formData = new FormData();
          formData.append(
            "image",
            fileToUpload,
            `image_${index}.${localImage.format}`,
          );

          const result = await apiUpload<UploadImageResponse>(
            "/api/uploads/image",
            formData,
          );

          if (!result.success || !result.image) {
            throw new Error(
              result.error || `Error al subir imagen ${index + 1}`,
            );
          }

          return {
            url: result.image.webpUrl || result.image.url,
            caption: localImage.caption,
            width: result.image.width,
            height: result.image.height,
            format: result.image.format,
          };
        }),
      );

      toast.success("Todas las imágenes subidas exitosamente", {
        id: "upload-all-success",
      });
      return results;
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir las imágenes",
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [localImages]);

  // Limpiar todas las imágenes locales
  const clearAllImages = useCallback(() => {
    setLocalImages((prevImages) => {
      prevImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
        if (image.originalUrl && image.originalUrl !== image.url) {
          URL.revokeObjectURL(image.originalUrl);
        }
      });
      return [];
    });
  }, []);

  // Obtener información de las imágenes para el formulario
  const getImageMetadata = useCallback(() => {
    return localImages.map((image) => ({
      name: image.file.name,
      size: image.file.size,
      format: image.format,
      caption: image.caption,
      hasEdits: !!image.editedBlob,
    }));
  }, [localImages]);

  // Cleanup al desmontar
  const cleanup = useCallback(() => {
    setLocalImages((prevImages) => {
      prevImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
        if (image.originalUrl && image.originalUrl !== image.url) {
          URL.revokeObjectURL(image.originalUrl);
        }
      });
      return prevImages; // No cambiar el estado, solo cleanup
    });
  }, []);

  return {
    localImages,
    isProcessing,
    addFiles,
    removeImage,
    updateEditedImage,
    reorderImages,
    uploadAllImages,
    clearAllImages,
    getImageMetadata,
    cleanup,
  };
}
