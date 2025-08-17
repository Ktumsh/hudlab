"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface LocalImage {
  id: string;
  file: File;
  url: string; // Object URL para preview
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  editedBlob?: Blob; // Para almacenar imagen editada
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

          // Validar tamaño (máximo 10MB)
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            toast.error(
              `El archivo ${file.name} es demasiado grande. Máximo 10MB`,
            );
            return null;
          }

          return {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url: URL.createObjectURL(file),
            format: file.type.replace("image/", ""),
          };
        })
        .filter(Boolean) as LocalImage[];

      if (newImages.length > 0) {
        toast.success(
          `${newImages.length} imagen${newImages.length > 1 ? "es" : ""} agregada${newImages.length > 1 ? "s" : ""}`,
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

  // Actualizar imagen editada
  const updateEditedImage = useCallback((index: number, editedBlob: Blob) => {
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
        };
      }
      return updated;
    });
  }, []);

  // Subir todas las imágenes a Cloudinary cuando se publique el upload
  const uploadAllImages = useCallback(async (): Promise<UploadedImage[]> => {
    // Usar una función que capture el estado actual
    const currentImages = await new Promise<LocalImage[]>((resolve) => {
      setLocalImages((images) => {
        resolve(images);
        return images;
      });
    });

    if (currentImages.length === 0) {
      throw new Error("No hay imágenes para subir");
    }

    setIsProcessing(true);

    try {
      const uploadPromises = currentImages.map(async (localImage, index) => {
        const fileToUpload = localImage.editedBlob || localImage.file;

        // Crear FormData con la imagen
        const formData = new FormData();
        formData.append(
          "image",
          fileToUpload,
          `image_${index}.${localImage.format}`,
        );

        // Hacer upload a Cloudinary
        const response = await fetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Error al subir imagen ${index + 1}`,
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || `Error al subir imagen ${index + 1}`);
        }

        return {
          url: result.image.url,
          caption: localImage.caption,
          width: result.image.width,
          height: result.image.height,
          format: result.image.format,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      toast.success("Todas las imágenes subidas exitosamente");
      return uploadedImages;
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir las imágenes",
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Limpiar todas las imágenes locales
  const clearAllImages = useCallback(() => {
    setLocalImages((prevImages) => {
      prevImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      return [];
    });
  }, []);

  // Obtener información de las imágenes para el formulario
  const getImageMetadata = useCallback(() => {
    // Usar una ref o callback para obtener el estado actual
    let currentMetadata: any[] = [];
    setLocalImages((images) => {
      currentMetadata = images.map((image) => ({
        name: image.file.name,
        size: image.file.size,
        format: image.format,
        caption: image.caption,
        hasEdits: !!image.editedBlob,
      }));
      return images;
    });
    return currentMetadata;
  }, []);

  // Cleanup al desmontar
  const cleanup = useCallback(() => {
    setLocalImages((prevImages) => {
      prevImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
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
    uploadAllImages,
    clearAllImages,
    getImageMetadata,
    cleanup,
  };
}
