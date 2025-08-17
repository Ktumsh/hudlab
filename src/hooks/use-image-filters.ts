import { useCallback, useEffect, useRef, useState } from "react";

export interface FilterSettings {
  brightness: number; // -100..100
  contrast: number; // -100..100
  saturation: number; // -100..100
  exposure: number; // -100..100 (EV approx)
  gamma: number; // -100..100 (maps to 0.5..2.0)
  clarity: number; // -100..100 (local contrast)
  temperature: number; // -100..100
  vignette: number; // -100..100 (negative = white, positive = black)
  // Transformaciones geométricas
  rotation?: number; // grados, -180..180 (0 por defecto)
  scale?: number; // porcentaje, -50..100 (0 = 100%)
  // Optional 4x5 color matrix (20 values) applied as [R',G',B',A'] = M * [R,G,B,A,1]
  colorMatrix?: number[]; // length 20 if present
}

export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  gamma: 0,
  clarity: 0,
  temperature: 0,
  vignette: 0,
  rotation: 0,
  scale: 0,
};

// Convert slider values (-100 to 100) to CSS filter percentages
// Conversión más amable: evita negros totales en -100 y excesos en +100
// Mapeo [-100,100] -> [30%, 170%] con curva suave alrededor de 0
export const convertToFilterValue = (sliderValue: number): number => {
  const v = Math.max(-100, Math.min(100, sliderValue)) / 100; // [-1,1]
  // easeOutCubic-like para respuesta agradable
  const sign = v < 0 ? -1 : 1;
  const a = Math.pow(Math.abs(v), 0.85) * sign; // curva suavizada
  const pct = 100 + a * 70; // rango +/-70% desde 100%
  return Math.max(30, Math.min(170, Math.round(pct)));
};

// Generate CSS filter string from filter settings
export const generateCSSFilterString = (filters: FilterSettings): string => {
  const brightness = convertToFilterValue(filters.brightness);
  const contrast = convertToFilterValue(filters.contrast);
  const saturation = filters.saturation + 100;
  // Nota: La "temperatura" se aplica en canvas por píxel (balance de blancos),
  // no mediante hue-rotate. Los thumbnails que usen esta cadena no reflejarán
  // la temperatura con exactitud, pero evitarán cambios de tono irreales.
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
};

// Apply filters to canvas context
export const applyFiltersToCanvas = (
  ctx: CanvasRenderingContext2D,
  filters: FilterSettings,
  image: HTMLImageElement,
  width: number,
  height: number,
  cropArea?: { x: number; y: number; width: number; height: number },
  previewTransform?: { zoom: number; offsetX: number; offsetY: number },
) => {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Apply CSS filters
  const brightness = convertToFilterValue(filters.brightness);
  const contrast = convertToFilterValue(filters.contrast);
  const saturation = filters.saturation + 100;
  ctx.filter = `
    brightness(${brightness}%) 
    contrast(${contrast}%) 
    saturate(${saturation}%)
  `;

  // Preparar transformaciones geométricas (rotación/escala)
  const angleDeg = filters.rotation ?? 0;
  const angleRad = (angleDeg * Math.PI) / 180;
  const scalePct = filters.scale ?? 0; // -50..100
  const s = Math.max(0.25, Math.min(4, 1 + scalePct / 100));
  const zoom = Math.max(0.5, Math.min(8, previewTransform?.zoom ?? 1));
  const panX = previewTransform?.offsetX ?? 0;
  const panY = previewTransform?.offsetY ?? 0;

  ctx.save();
  // Dibujar centrado, aplicando pan/zoom y transformaciones opcionales
  ctx.translate(width / 2 + panX, height / 2 + panY);
  if (Math.abs(angleDeg) > 0.001) ctx.rotate(angleRad);
  // Escalado combinado de filtro (scale) y zoom de previsualización
  ctx.scale(s * zoom, s * zoom);

  if (cropArea) {
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      -width / 2,
      -height / 2,
      width,
      height,
    );
  } else {
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
  }
  ctx.restore();

  // Per-pixel adjustments: temperature + exposure + gamma, then clarity
  if (
    filters.temperature !== 0 ||
    filters.exposure !== 0 ||
    filters.gamma !== 0
  ) {
    // Temperature gains
    const t = Math.max(-100, Math.min(100, filters.temperature)) / 100; // [-1, 1]
    const rGain = 1 + 0.5 * t;
    const gGain = 1 - 0.1 * t;
    const bGain = 1 - 0.5 * t;

    // Exposure factor: map [-100,100] -> EV [-2,2] -> 2^EV
    const ev = (Math.max(-100, Math.min(100, filters.exposure)) / 100) * 2; // [-2,2]
    const exposureFactor = Math.pow(2, ev);

    // Gamma correction: map [-100,100] -> gamma [0.5, 2.0]
    const gammaSlider = Math.max(-100, Math.min(100, filters.gamma));
    const gammaValue = 1 + (gammaSlider / 100) * 0.5; // [0.5..1.5]
    const gamma = Math.max(0.5, Math.min(2.0, gammaValue));
    const invGamma = 1 / gamma;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data; // RGBA
    for (let i = 0; i < data.length; i += 4) {
      // temperature
      let r = data[i] * rGain;
      let g = data[i + 1] * gGain;
      let b = data[i + 2] * bGain;
      // exposure
      r *= exposureFactor;
      g *= exposureFactor;
      b *= exposureFactor;
      // gamma correction (normalize to [0,1], apply pow, scale back)
      r = 255 * Math.pow(Math.min(1, Math.max(0, r / 255)), invGamma);
      g = 255 * Math.pow(Math.min(1, Math.max(0, g / 255)), invGamma);
      b = 255 * Math.pow(Math.min(1, Math.max(0, b / 255)), invGamma);
      // clamp
      data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Apply 4x5 color matrix if provided
  if (filters.colorMatrix && filters.colorMatrix.length === 20) {
    const m = filters.colorMatrix;
    const imageData = ctx.getImageData(0, 0, width, height);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const a = d[i + 3] / 255;
      const r2 = m[0] * r + m[1] * g + m[2] * b + m[3] * (a * 255) + m[4] * 255;
      const g2 = m[5] * r + m[6] * g + m[7] * b + m[8] * (a * 255) + m[9] * 255;
      const b2 =
        m[10] * r + m[11] * g + m[12] * b + m[13] * (a * 255) + m[14] * 255;
      const a2 =
        m[15] * r + m[16] * g + m[17] * b + m[18] * (a * 255) + m[19] * 255;
      d[i] = r2 < 0 ? 0 : r2 > 255 ? 255 : r2;
      d[i + 1] = g2 < 0 ? 0 : g2 > 255 ? 255 : g2;
      d[i + 2] = b2 < 0 ? 0 : b2 > 255 ? 255 : b2;
      d[i + 3] = a2 < 0 ? 0 : a2 > 255 ? 255 : a2;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Clarity (local contrast) via simple unsharp mask / blur depending on sign
  if (filters.clarity !== 0) {
    const amount = Math.max(-100, Math.min(100, filters.clarity)) / 100; // [-1,1]
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const s = src.data,
      d = dst.data;
    // Kernel weights
    const k = Math.abs(amount) * 0.5; // 0..0.5
    const center = amount >= 0 ? 1 + 8 * k : 1 - 8 * k;
    const neighbor = amount >= 0 ? -k : k;
    const w = width,
      h = height;
    const idx = (x: number, y: number) => (y * w + x) * 4;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kyx = -1; kyx <= 1; kyx++) {
            const nx = Math.min(w - 1, Math.max(0, x + kyx));
            const ny = Math.min(h - 1, Math.max(0, y + ky));
            const ii = idx(nx, ny);
            const weight = ky === 0 && kyx === 0 ? center : neighbor;
            r += s[ii] * weight;
            g += s[ii + 1] * weight;
            b += s[ii + 2] * weight;
            a += s[ii + 3] * (ky === 0 && kyx === 0 ? 1 : 0);
          }
        }
        const o = idx(x, y);
        d[o] = r < 0 ? 0 : r > 255 ? 255 : r;
        d[o + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        d[o + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
        d[o + 3] = a || s[o + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  // Vignette effect: positive = black, negative = white
  if (filters.vignette !== 0) {
    ctx.filter = "none";

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

    const v = Math.max(-100, Math.min(100, filters.vignette)) / 100;
    const strength = Math.abs(v);
    const isWhite = v < 0;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      maxRadius * 0.2,
      centerX,
      centerY,
      maxRadius * 0.8,
    );

    if (isWhite) {
      gradient.addColorStop(0, `rgba(255,255,255,0)`);
      gradient.addColorStop(0.4, `rgba(255,255,255,${strength * 0.08})`);
      gradient.addColorStop(0.7, `rgba(255,255,255,${strength * 0.25})`);
      gradient.addColorStop(1, `rgba(255,255,255,${strength * 0.6})`);
      ctx.globalCompositeOperation = "screen"; // lighten edges
    } else {
      gradient.addColorStop(0, `rgba(0,0,0,0)`);
      gradient.addColorStop(0.4, `rgba(0,0,0,${strength * 0.1})`);
      gradient.addColorStop(0.7, `rgba(0,0,0,${strength * 0.3})`);
      gradient.addColorStop(1, `rgba(0,0,0,${strength * 0.7})`);
      ctx.globalCompositeOperation = "multiply";
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }
};

export const useImageFilters = (imageUrl: string) => {
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);

  const setFiltersWithLogging = useCallback((newFilters: FilterSettings) => {
    setFilters(newFilters);
  }, []);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  // Área de recorte para previsualización (en px sobre dimensiones naturales)
  const previewCropRef = useRef<
    { x: number; y: number; width: number; height: number } | undefined
  >(undefined);
  // Transformación de vista (solo previsualización): pan/zoom
  const previewTransformRef = useRef<{
    zoom: number;
    offsetX: number;
    offsetY: number;
  }>({ zoom: 1, offsetX: 0, offsetY: 0 });
  // Tick para forzar re-render cuando cambia el transform de previsualización
  const [previewTransformVersion, setPreviewTransformVersion] = useState(0);

  // Create export canvas if it doesn't exist
  useEffect(() => {
    if (!exportCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.style.display = "none";
      document.body.appendChild(canvas);
      exportCanvasRef.current = canvas;
    }

    return () => {
      // Cleanup on unmount
      if (exportCanvasRef.current && exportCanvasRef.current.parentNode) {
        exportCanvasRef.current.parentNode.removeChild(exportCanvasRef.current);
      }
    };
  }, []);

  // Load original image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalImage(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update preview canvas when filters change
  const updatePreviewCanvas = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null;
    if (!ctx) return;

    // Base dimensions para calcular ratio (usar crop si existe)
    const baseW = previewCropRef.current?.width || originalImage.naturalWidth;
    const baseH = previewCropRef.current?.height || originalImage.naturalHeight;
    const aspect = baseW / baseH;

    // Altura fija, ancho según ratio. Responsive: algo menor en móvil.
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const fixedHeight = isMobile ? 300 : 420; // px visibles coherentes
    let displayHeight = fixedHeight;
    let displayWidth = displayHeight * aspect;

    // Evitar anchos gigantes en panorámicas extremas
    const maxWidth = isMobile ? 640 : 900;
    if (displayWidth > maxWidth) {
      displayWidth = maxWidth;
      displayHeight = Math.round(displayWidth / aspect);
    }

    canvas.width = Math.round(displayWidth);
    canvas.height = Math.round(displayHeight);
    // Forzar estilo para mantener altura constante y ancho por ratio
    const style = canvas.style as CSSStyleDeclaration;
    style.height = `${fixedHeight}px`;
    style.width = "auto";

    // El pan/zoom de previsualización se aplica vía CSS transform (PanZoomStage)
    // para mantener la interacción fluida; aquí no lo aplicamos al canvas.
    applyFiltersToCanvas(
      ctx,
      filters,
      originalImage,
      canvas.width,
      canvas.height,
      previewCropRef.current,
    );
  }, [originalImage, filters]);

  useEffect(() => {
    updatePreviewCanvas();
  }, [updatePreviewCanvas]);

  // Export filtered image
  const exportImage = useCallback(
    async (cropArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): Promise<string | null> => {
      const canvas = exportCanvasRef.current;
      if (!canvas || !originalImage) {
        console.error("Canvas o imagen original no disponible");
        return null;
      }

      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null;
      if (!ctx) {
        console.error("No se pudo obtener el contexto del canvas");
        return null;
      }

      if (cropArea) {
        // For cropped export, use the crop dimensions directly
        canvas.width = Math.round(cropArea.width);
        canvas.height = Math.round(cropArea.height);

        applyFiltersToCanvas(
          ctx,
          filters,
          originalImage,
          canvas.width,
          canvas.height,
          {
            x: Math.round(cropArea.x),
            y: Math.round(cropArea.y),
            width: Math.round(cropArea.width),
            height: Math.round(cropArea.height),
          },
        );
      } else {
        // Full image export - use original dimensions
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;

        applyFiltersToCanvas(
          ctx,
          filters,
          originalImage,
          canvas.width,
          canvas.height,
        );
      }

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              console.error("Error al crear blob de la imagen");
              resolve(null);
            }
          },
          "image/jpeg",
          0.9,
        );
      });
    },
    [filters, originalImage],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const resetFilter = useCallback((filterName: keyof FilterSettings) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: DEFAULT_FILTERS[filterName],
    }));
  }, []);

  const isFilterModified = useCallback(
    (filterName: keyof FilterSettings) => {
      return filters[filterName] !== DEFAULT_FILTERS[filterName];
    },
    [filters],
  );

  const hasAnyFilterModified = useCallback(() => {
    return Object.keys(DEFAULT_FILTERS).some((key) =>
      isFilterModified(key as keyof FilterSettings),
    );
  }, [isFilterModified]);

  const forceCanvasUpdate = useCallback(() => {
    updatePreviewCanvas();
  }, [updatePreviewCanvas]);

  const setPreviewCrop = useCallback(
    (crop?: { x: number; y: number; width: number; height: number } | null) => {
      previewCropRef.current =
        crop && crop.width > 0 && crop.height > 0 ? crop : undefined;
      updatePreviewCanvas();
    },
    [updatePreviewCanvas],
  );

  const setPreviewTransform = useCallback(
    (
      transform: Partial<{ zoom: number; offsetX: number; offsetY: number }>,
    ) => {
      previewTransformRef.current = {
        ...previewTransformRef.current,
        ...transform,
      };
      // forzar re-render para que PanZoomStage reciba el nuevo zoom
      setPreviewTransformVersion((v) => v + 1);
      updatePreviewCanvas();
    },
    [updatePreviewCanvas],
  );

  const resetPreviewTransform = useCallback(() => {
    previewTransformRef.current = { zoom: 1, offsetX: 0, offsetY: 0 };
    setPreviewTransformVersion((v) => v + 1);
    updatePreviewCanvas();
  }, [updatePreviewCanvas]);

  const getPreviewTransform = useCallback(() => {
    return previewTransformRef.current;
  }, []);

  return {
    filters,
    setFilters: setFiltersWithLogging,
    originalImage,
    previewCanvasRef,
    exportCanvasRef,
    exportImage,
    resetFilters,
    resetFilter,
    isFilterModified,
    hasAnyFilterModified,
    forceCanvasUpdate,
    setPreviewCrop,
    setPreviewTransform,
    resetPreviewTransform,
    getPreviewTransform,
    previewTransformVersion,
  };
};
