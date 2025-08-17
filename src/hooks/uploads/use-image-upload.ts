"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import { apiUpload, apiDelete } from "@/lib/fetcher";

interface UploadImageData {
  url: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  publicId?: string;
  caption?: string;
}

interface UploadImageResponse {
  success: boolean;
  error?: string;
  image?: {
    url: string;
    width: number;
    height: number;
    format: string;
    size: number;
    publicId: string;
  };
}

interface DeleteImageResponse {
  success: boolean;
  error?: string;
}

export function useImageUpload() {
  const [uploadedImages, setUploadedImages] = useState<UploadImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { trigger: triggerImageUpload } = useSWRMutation(
    "/api/uploads/image",
    async (_url, { arg }: { arg: FormData }) =>
      apiUpload<UploadImageResponse>("/api/uploads/image", arg),
  );

  const { trigger: triggerImageDelete } = useSWRMutation(
    "/api/uploads/image/delete",
    async (_url, { arg }: { arg: { publicId: string } }) =>
      apiDelete<DeleteImageResponse>(`/api/uploads/image/${arg.publicId}`),
  );

  const uploadImages = useCallback(
    async (files: File[]) => {
      // Verificar límite de imágenes
      if (uploadedImages.length + files.length > 5) {
        toast.error("No puedes agregar más de 5 imágenes");
        return;
      }

      setIsUploading(true);

      try {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);

          const result = await triggerImageUpload(formData);

          if (result.success && result.image) {
            return {
              url: result.image.url,
              width: result.image.width,
              height: result.image.height,
              format: result.image.format,
              size: result.image.size,
              publicId: result.image.publicId,
            };
          } else {
            throw new Error(result.error || "Error al subir imagen");
          }
        });

        const newImages = await Promise.all(uploadPromises);
        setUploadedImages((prev) => [...prev, ...newImages]);

        toast.success(
          `${newImages.length} imagen${newImages.length > 1 ? "es" : ""} subida${newImages.length > 1 ? "s" : ""} exitosamente`,
        );
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Error al subir las imágenes");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadedImages.length, triggerImageUpload],
  );

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Limpiar todas las imágenes de Cloudinary (para cuando se cancela)
  const cleanupImages = useCallback(async () => {
    try {
      const deletePromises = uploadedImages
        .filter((img) => img.publicId)
        .map((img) => triggerImageDelete({ publicId: img.publicId! }));

      await Promise.all(deletePromises);
      console.log("Imágenes temporales limpiadas de Cloudinary");
    } catch (error) {
      console.error("Error limpiando imágenes temporales:", error);
      // No mostramos toast aquí porque el usuario ya está cancelando
    }
  }, [uploadedImages, triggerImageDelete]);

  // Resetear estado local
  const resetImages = useCallback(() => {
    setUploadedImages([]);
  }, []);

  // Limpiar y resetear (para cuando se cancela el formulario)
  const cancelAndCleanup = useCallback(async () => {
    await cleanupImages();
    resetImages();
  }, [cleanupImages, resetImages]);

  return {
    uploadedImages,
    isUploading,
    uploadImages,
    removeImage,
    resetImages,
    cleanupImages,
    cancelAndCleanup,
  };
}
