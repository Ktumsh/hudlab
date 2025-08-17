"use client";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import type { Game } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import ImagesStep from "@/components/upload/steps/images-step";
import MetadataStep from "@/components/upload/steps/metadata-step";
import ReviewStep from "@/components/upload/steps/review-step";
import SuccessStep from "@/components/upload/steps/success-step";
import { useLocalImages } from "@/hooks/uploads/use-local-images";
import { cn } from "@/lib";
import { apiPost } from "@/lib/fetcher";
import { CreateUploadFormData } from "@/lib/form-schemas";

interface CreateUploadFormProps {
  children: React.ReactNode;
}

interface CreateUploadResponse {
  success: boolean;
  error?: string;
  upload?: {
    id: string;
    title: string;
    publicId: number;
  };
}

// (Animaciones removidas temporalmente)

const CreateUploadForm = ({ children }: CreateUploadFormProps) => {
  const [open, setOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [step, setStep] = useState<
    "images" | "review" | "metadata" | "success"
  >("images");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [extractedTags, setExtractedTags] = useState<string[]>([]);

  // Hook para manejar las imágenes localmente
  const {
    localImages,
    isProcessing,
    addFiles,
    removeImage,
    updateEditedImage,
    reorderImages,
    uploadAllImages,
    clearAllImages,
    cleanup,
  } = useLocalImages();
  const { trigger: triggerCreate } = useSWRMutation(
    "/api/uploads",
    async (_url, { arg }: { arg: CreateUploadFormData }) =>
      apiPost<CreateUploadResponse>("/api/uploads", { body: arg }),
  );

  const navigateToStep = (newStep: typeof step) => {
    setStep(newStep);
  };

  const handleSubmit = async (data: CreateUploadFormData) => {
    try {
      if (localImages.length === 0) {
        toast.error("Debes agregar al menos una imagen");
        return;
      }

      // Primero subir todas las imágenes a Cloudinary
      const uploadedImages = await uploadAllImages();

      // Limpiar descripción: remover hashtags "#tag" y espacios extra
      const cleanedDescription = (data.description || "")
        .replace(/#[\w\u00c0-\u024f\u1e00-\u1eff]+(?=\s|$)/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      const payload = {
        ...data,
        gameId: selectedGame?.id || data.gameId,
        // Asegurar tags como string plano
        tags:
          extractedTags.length > 0 ? extractedTags.join(", ") : data.tags || "",
        // Si la descripción queda vacía por contener solo hashtags, enviar undefined
        description:
          cleanedDescription.length > 0 ? cleanedDescription : undefined,
        // Asegurar que el tipo sea el nombre (backend espera name, no id)
        type: data.type,
        images: uploadedImages,
      };

      const result = await triggerCreate(payload);

      if (result.success && result.upload) {
        toast.success("¡HUD creado exitosamente!");

        // Animación de éxito (similar a Pinterest)
        setStep("success");

        setTimeout(() => {
          clearAllImages();
          setSelectedGame(null);
          setExtractedTags([]);
          setStep("images");
          setOpen(false);
        }, 2000);
      } else {
        toast.error(result.error || "Error al crear el HUD");
      }
    } catch (error) {
      console.error("Error creating upload:", error);
      toast.error("Error inesperado al crear el HUD");
    }
  };

  // Manejar cierre del dialog con cleanup
  const handleOpenChange = useCallback(
    async (newOpen: boolean) => {
      // Intercepta cierre por outside click o ESC
      if (!newOpen) {
        const hasWork =
          localImages.length > 0 ||
          !!selectedGame ||
          extractedTags.length > 0 ||
          step !== "images";
        if (hasWork) {
          // muestra confirmación en vez de cerrar
          setConfirmDiscardOpen(true);
          return; // no cierres aún
        }
      }
      setOpen(newOpen);
    },
    [localImages.length, selectedGame, extractedTags.length, step],
  );

  const confirmDiscard = useCallback(() => {
    // limpiar y cerrar ambos diálogos
    clearAllImages();
    setSelectedGame(null);
    setExtractedTags([]);
    setStep("images");
    setConfirmDiscardOpen(false);
    setOpen(false);
  }, [clearAllImages]);

  // Cleanup cuando el componente se desmonte
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn("sm:max-w-2xl", step === "review" && "sm:max-w-4xl")}
      >
        <DialogHeader>
          <DialogTitle>
            {step === "images"
              ? "Agregar imágenes"
              : step === "review"
                ? "Revisar y editar imágenes"
                : step === "metadata"
                  ? "Detalles del HUD"
                  : "¡Éxito!"}
          </DialogTitle>
          <DialogDescription>
            {step === "images"
              ? "Sube las imágenes de tu HUD"
              : step === "review"
                ? "Revisa y edita tus imágenes aplicando filtros o recortando."
                : step === "metadata"
                  ? "Completa la información de tu HUD"
                  : "HUD creado exitosamente"}
          </DialogDescription>
        </DialogHeader>

        {step === "images" && (
          <ImagesStep
            localImages={localImages}
            isProcessing={isProcessing}
            onFilesSelected={addFiles}
            onRemoveImage={removeImage}
            onNext={() => navigateToStep("review")}
            maxFiles={5}
            onReorder={reorderImages} // Added onReorder prop
          />
        )}

        {step === "review" && (
          <ReviewStep
            localImages={localImages}
            onUpdateImage={updateEditedImage}
            onNext={() => navigateToStep("metadata")}
            onPrevious={() => navigateToStep("images")}
          />
        )}

        {step === "metadata" && (
          <MetadataStep
            selectedGame={selectedGame}
            isProcessing={isProcessing}
            onGameSelect={setSelectedGame}
            onTagsChange={setExtractedTags}
            onSubmit={handleSubmit}
            onPrevious={() => navigateToStep("review")}
          />
        )}

        {step === "success" && <SuccessStep />}
      </DialogContent>

      {/* Confirmación de descarte (segundo Dialog controlado) */}
      <Dialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Descartar este HUD?</DialogTitle>
            <DialogDescription>
              Perderás los cambios realizados (imágenes, selección y datos
              cargados).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDiscardOpen(false)}
            >
              Continuar editando
            </Button>
            <Button variant="error" onClick={confirmDiscard}>
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CreateUploadForm;
