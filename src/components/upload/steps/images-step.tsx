"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import UploadDropzone from "@/components/upload/upload-dropzone";
import { LocalImage } from "@/hooks/uploads/use-local-images";

interface ImagesStepProps {
  localImages: LocalImage[];
  isProcessing: boolean;
  onFilesSelected: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onNext: () => void;
  maxFiles?: number;
}

export default function ImagesStep({
  localImages,
  isProcessing,
  onFilesSelected,
  onRemoveImage,
  onReorder,
  onNext,
  maxFiles = 5,
}: ImagesStepProps) {
  const canProceed = localImages.length > 0;

  return (
    <>
      <div className="space-y-4">
        {/* Dropzone profesional */}
        <UploadDropzone
          uploadedImages={localImages}
          isUploading={isProcessing}
          onFilesSelected={onFilesSelected}
          onRemoveImage={onRemoveImage}
          onReorder={onReorder}
          maxFiles={maxFiles}
        />

        {/* Información de ayuda */}
        {localImages.length === 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <p className="text-content-muted col-span-2 mx-auto text-sm md:col-span-5">
              Puedes agregar hasta {maxFiles} imágenes
            </p>
          </div>
        )}

        {/* Estadísticas de imágenes */}
        {localImages.length > 0 && (
          <div className="flex justify-center gap-4 text-sm">
            <div>
              <span className="sr-only">Imágenes</span>
              <span className="ml-2">
                {localImages.length} / {maxFiles}
              </span>
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="primary"
          disabled={!canProceed}
          onClick={onNext}
        >
          Siguiente
        </Button>
      </DialogFooter>
    </>
  );
}
