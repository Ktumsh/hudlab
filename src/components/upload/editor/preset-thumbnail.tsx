"use client";

import Image from "next/image";
import { memo, useEffect, useState } from "react";

import {
  applyFiltersToCanvas,
  type FilterSettings,
} from "@/hooks/use-image-filters";

interface PresetThumbnailButtonProps {
  presetName: string;
  filters: FilterSettings;
  originalImage: HTMLImageElement | null;
  imageUrl: string;
  onClick: () => void;
}

const PresetThumbnail = ({
  presetName,
  filters,
  originalImage,
  imageUrl,
  onClick,
}: PresetThumbnailButtonProps) => {
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    if (!originalImage) {
      setThumbSrc(null);
      return;
    }

    const img = originalImage;
    const targetW = 85;
    const targetH = 85;

    // Calcular recorte tipo "cover" para mantener encuadre sin deformar
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const srcAR = srcW / srcH;
    const dstAR = targetW / targetH;
    let cropX = 0,
      cropY = 0,
      cropW = srcW,
      cropH = srcH;
    if (srcAR > dstAR) {
      // Demasiado ancho: recortar lados
      cropH = srcH;
      cropW = Math.round(srcH * dstAR);
      cropX = Math.round((srcW - cropW) / 2);
      cropY = 0;
    } else {
      // Demasiado alto: recortar arriba/abajo
      cropW = srcW;
      cropH = Math.round(srcW / dstAR);
      cropX = 0;
      cropY = Math.round((srcH - cropH) / 2);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    applyFiltersToCanvas(ctx, filters, img, targetW, targetH, {
      x: cropX,
      y: cropY,
      width: cropW,
      height: cropH,
    });

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          revoked = url;
          setThumbSrc(url);
        } else {
          setThumbSrc(null);
        }
      },
      "image/jpeg",
      0.8,
    );

    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [originalImage, filters]);

  return (
    <button
      onClick={onClick}
      className="relative aspect-square size-16 shrink-0 overflow-hidden"
    >
      {thumbSrc ? (
        <Image
          src={thumbSrc}
          alt={presetName}
          width={85}
          height={85}
          className="h-full w-full object-cover"
          unoptimized
          loading="lazy"
        />
      ) : (
        // Fallback mientras carga la original: mostrar imagen sin filtros
        <Image
          src={imageUrl}
          alt={presetName}
          width={85}
          height={85}
          className="h-full object-cover"
        />
      )}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent to-40% p-2">
        <span className="text-xs font-medium text-white">{presetName}</span>
      </div>
    </button>
  );
};

export default memo(PresetThumbnail, (prevProps, nextProps) => {
  return (
    prevProps.presetName === nextProps.presetName &&
    prevProps.filters === nextProps.filters &&
    prevProps.originalImage === nextProps.originalImage &&
    prevProps.imageUrl === nextProps.imageUrl
  );
});
