"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  convertToPixelCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";

import {
  useImageFilters,
  type FilterSettings,
} from "@/hooks/use-image-filters";
import {
  enforceAspectOnPixelCrop,
  fitMaxAspectCropAtCenter,
} from "@/lib/editor";

export type EditorTab = "filters" | "adjustments" | "crop";

export interface UseImageEditorParams {
  imageUrl: string;
  initialFilters?: FilterSettings;
  initialAspectRatio?: number | undefined;
  initialCrop?: { x: number; y: number; width: number; height: number };
  onSave: (
    url: string,
    filters: FilterSettings,
    crop?: {
      aspectRatio?: number;
      crop?: { x: number; y: number; width: number; height: number };
    },
  ) => void;
}

export const useImageEditor = ({
  imageUrl,
  initialFilters,
  initialAspectRatio,
  initialCrop,
  onSave,
}: UseImageEditorParams) => {
  // Tabs y estado de recorte
  const [activeTab, setImageEditorTab] = useState<EditorTab>("filters");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<
    number | undefined
  >(initialAspectRatio);

  // Filtros y canvas
  const {
    filters,
    setFilters,
    originalImage,
    previewCanvasRef,
    exportImage,
    resetFilter,
    resetFilters,
    isFilterModified,
    forceCanvasUpdate,
    setPreviewCrop,
    setPreviewTransform,
    resetPreviewTransform,
    getPreviewTransform,
    previewTransformVersion,
  } = useImageFilters(imageUrl);

  // Inicializar filtros si vienen desde fuera
  useEffect(() => {
    if (initialFilters) setFilters(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si hay crop inicial (en px), guardarlo para convertirlo luego
  useEffect(() => {
    if (initialCrop) {
      setCompletedCrop({ ...initialCrop, unit: "px" as const });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refs auxiliares
  const imgRef = useRef<HTMLImageElement>(null);
  const didInitCropRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Historial de estados
  type EditorSnapshot = {
    filters: FilterSettings;
    selectedAspectRatio: number | undefined;
    completedCrop?: PixelCrop;
    previewTransform: { zoom: number; offsetX: number; offsetY: number };
  };
  const historyRef = useRef<EditorSnapshot[]>([]);
  const futureRef = useRef<EditorSnapshot[]>([]);
  // Versión para forzar re-render cuando cambie el historial
  const [, setHistoryVersion] = useState(0);

  const getSnapshot = useCallback(
    (): EditorSnapshot => ({
      filters: { ...filters },
      selectedAspectRatio,
      completedCrop: completedCrop ? { ...completedCrop } : undefined,
      previewTransform: { ...getPreviewTransform() },
    }),
    [filters, selectedAspectRatio, completedCrop, getPreviewTransform],
  );

  const deepEqualSnapshots = useCallback(
    (a?: EditorSnapshot, b?: EditorSnapshot) => {
      if (!a || !b) return false;
      if (a.selectedAspectRatio !== b.selectedAspectRatio) return false;
      return (
        JSON.stringify(a.filters) === JSON.stringify(b.filters) &&
        JSON.stringify(a.completedCrop) === JSON.stringify(b.completedCrop) &&
        JSON.stringify(a.previewTransform) ===
          JSON.stringify(b.previewTransform)
      );
    },
    [],
  );

  // Ref para guardar el estado anterior
  const previousStateRef = useRef<EditorSnapshot | null>(null);

  // Flag para evitar guardar al history durante undo/redo
  const isApplyingSnapshotRef = useRef(false);

  // Detectar cambios y guardar el estado anterior al history
  useEffect(() => {
    if (!isInitializedRef.current || isApplyingSnapshotRef.current) return;

    const currentState = getSnapshot();

    // Si hay un estado anterior y es diferente al actual, guardarlo
    if (
      previousStateRef.current &&
      !deepEqualSnapshots(previousStateRef.current, currentState)
    ) {
      const last = historyRef.current[historyRef.current.length - 1];
      if (!deepEqualSnapshots(last, previousStateRef.current)) {
        historyRef.current.push(previousStateRef.current);
        futureRef.current = [];
        setHistoryVersion((v) => v + 1);
      }
    }

    // Actualizar el estado anterior
    previousStateRef.current = currentState;
  }, [
    filters,
    selectedAspectRatio,
    completedCrop,
    getSnapshot,
    deepEqualSnapshots,
  ]);

  const saveCurrentStateToHistory = useCallback(() => {
    // Función para casos especiales (reset, crop, etc)
    const currentState = getSnapshot();
    const last = historyRef.current[historyRef.current.length - 1];
    if (!deepEqualSnapshots(last, currentState)) {
      historyRef.current.push(currentState);
      futureRef.current = [];
      setHistoryVersion((v) => v + 1);
    }
  }, [getSnapshot, deepEqualSnapshots]);

  // Inicializar estado inicial en history cuando la imagen esté lista
  useEffect(() => {
    if (originalImage && !isInitializedRef.current) {
      isInitializedRef.current = true;

      // Guardar el estado inicial inmediatamente
      requestAnimationFrame(() => {
        const initialState = getSnapshot();
        historyRef.current = []; // NO incluir estado inicial en history
        futureRef.current = [];
        setHistoryVersion((v) => v + 1);
        // Inicializar también el previousState
        previousStateRef.current = initialState;
      });
    }
  }, [originalImage, getSnapshot]);
  const canUndo = () => historyRef.current.length > 0;
  const canRedo = () => futureRef.current.length > 0;

  const applySnapshot = useCallback(
    (snap: EditorSnapshot) => {
      // Activar flag para evitar que el useEffect guarde al history
      isApplyingSnapshotRef.current = true;

      setFilters(snap.filters);
      setSelectedAspectRatio(snap.selectedAspectRatio);
      if (snap.completedCrop) {
        setCompletedCrop(snap.completedCrop);
        setPreviewCrop({
          x: snap.completedCrop.x,
          y: snap.completedCrop.y,
          width: snap.completedCrop.width,
          height: snap.completedCrop.height,
        });
      } else {
        setCompletedCrop(undefined);
        setPreviewCrop(undefined);
      }
      setPreviewTransform(snap.previewTransform);

      // Desactivar flag después de un frame para permitir futuras detecciones
      requestAnimationFrame(() => {
        forceCanvasUpdate();
        requestAnimationFrame(() => {
          isApplyingSnapshotRef.current = false;
          // Actualizar el previousState sin disparar el useEffect
          previousStateRef.current = snap;
        });
      });
    },
    [forceCanvasUpdate, setFilters, setPreviewCrop, setPreviewTransform],
  );

  const undo = useCallback(() => {
    if (!canUndo()) return;

    // Guardar estado actual al future antes de hacer undo
    const currentState = getSnapshot();
    futureRef.current.push(currentState);

    // Tomar y aplicar el último estado del history
    const previousState = historyRef.current.pop()!;
    applySnapshot(previousState);

    setHistoryVersion((v) => v + 1);
  }, [applySnapshot, getSnapshot]);

  const redo = useCallback(() => {
    if (!canRedo()) return;

    // Guardar estado actual al history antes de hacer redo
    const currentState = getSnapshot();
    historyRef.current.push(currentState);
    // Tomar y aplicar el último estado del future
    const nextState = futureRef.current.pop()!;
    applySnapshot(nextState);

    setHistoryVersion((v) => v + 1);
  }, [applySnapshot, getSnapshot]); // Cambio de pestañas (controla previewCrop también)
  const handleTabChange = useCallback(
    (tab: EditorTab) => {
      if (
        tab === "crop" &&
        selectedAspectRatio !== undefined &&
        completedCrop &&
        !crop &&
        imgRef.current
      ) {
        const img = imgRef.current;
        const percentCrop = {
          unit: "%" as const,
          x: (completedCrop.x / img.naturalWidth) * 100,
          y: (completedCrop.y / img.naturalHeight) * 100,
          width: (completedCrop.width / img.naturalWidth) * 100,
          height: (completedCrop.height / img.naturalHeight) * 100,
        };
        setCrop(percentCrop);
      }

      if (tab === "crop") {
        // Al entrar a recorte, resetear zoom para encajar el marco de aspecto
        saveCurrentStateToHistory();
        resetPreviewTransform();
        setPreviewCrop(undefined);
      } else if (completedCrop) {
        setPreviewCrop({
          x: completedCrop.x,
          y: completedCrop.y,
          width: completedCrop.width,
          height: completedCrop.height,
        });
      }

      setImageEditorTab(tab);
      requestAnimationFrame(() => forceCanvasUpdate());
    },
    [
      completedCrop,
      crop,
      forceCanvasUpdate,
      resetPreviewTransform,
      saveCurrentStateToHistory,
      selectedAspectRatio,
      setPreviewCrop,
    ],
  );

  // Carga de imagen para dimensionar canvas y configurar crop inicial
  const onImageLoad = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    forceCanvasUpdate();

    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    if (canvasWidth <= 0 || canvasHeight <= 0) return;

    if (
      !didInitCropRef.current &&
      completedCrop &&
      completedCrop.unit === "px"
    ) {
      const base =
        selectedAspectRatio !== undefined
          ? enforceAspectOnPixelCrop(
              completedCrop,
              selectedAspectRatio,
              img.naturalWidth,
              img.naturalHeight,
            )
          : completedCrop;
      const percentCrop = {
        unit: "%" as const,
        x: (base.x / img.naturalWidth) * 100,
        y: (base.y / img.naturalHeight) * 100,
        width: (base.width / img.naturalWidth) * 100,
        height: (base.height / img.naturalHeight) * 100,
      };
      setCrop(percentCrop);
      setCompletedCrop(base);
      setPreviewCrop({
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
      });
      didInitCropRef.current = true;
      return;
    }

    if (!didInitCropRef.current && selectedAspectRatio !== undefined) {
      const imageAspectRatio = canvasWidth / canvasHeight;
      let cropWidth: number, cropHeight: number, cropX: number, cropY: number;
      if (selectedAspectRatio > imageAspectRatio) {
        cropWidth = 100;
        cropHeight = (100 * imageAspectRatio) / selectedAspectRatio;
        cropX = 0;
        cropY = (100 - cropHeight) / 2;
      } else {
        cropHeight = 100;
        cropWidth = (100 * selectedAspectRatio) / imageAspectRatio;
        cropX = (100 - cropWidth) / 2;
        cropY = 0;
      }
      const initialCrop = {
        unit: "%" as const,
        width: cropWidth,
        height: cropHeight,
        x: cropX,
        y: cropY,
      };
      requestAnimationFrame(() => setCrop(initialCrop));
      const scaleX = img.naturalWidth / canvasWidth;
      const scaleY = img.naturalHeight / canvasHeight;
      const px = {
        x: (initialCrop.x / 100) * canvasWidth * scaleX,
        y: (initialCrop.y / 100) * canvasHeight * scaleY,
        width: (initialCrop.width / 100) * canvasWidth * scaleX,
        height: (initialCrop.height / 100) * canvasHeight * scaleY,
      };
      setPreviewCrop(px);
      didInitCropRef.current = true;
    } else {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setPreviewCrop(undefined);
    }
  }, [
    completedCrop,
    forceCanvasUpdate,
    previewCanvasRef,
    selectedAspectRatio,
    setPreviewCrop,
  ]);

  // Cambio de relación de aspecto
  const handleAspectRatioChange = useCallback(
    (aspectRatio: number | undefined) => {
      setSelectedAspectRatio(aspectRatio);

      if (aspectRatio === undefined) {
        saveCurrentStateToHistory();
        setCrop(undefined);
        setCompletedCrop(undefined);
        setPreviewCrop(undefined);
        requestAnimationFrame(() => forceCanvasUpdate());
        return;
      }

      // Al seleccionar un aspect ratio concreto, resetear zoom para encajar
      resetPreviewTransform();

      const img = imgRef.current;
      if (img) {
        let basePx: PixelCrop | undefined = completedCrop;
        if (!basePx && crop) {
          basePx = {
            x: (crop.x! / 100) * img.naturalWidth,
            y: (crop.y! / 100) * img.naturalHeight,
            width: (crop.width! / 100) * img.naturalWidth,
            height: (crop.height! / 100) * img.naturalHeight,
            unit: "px",
          } as PixelCrop;
        }
        if (basePx) {
          const cx = basePx.x + basePx.width / 2;
          const cy = basePx.y + basePx.height / 2;
          const adjusted = fitMaxAspectCropAtCenter(
            cx,
            cy,
            aspectRatio,
            img.naturalWidth,
            img.naturalHeight,
          );
          const newPercent = {
            unit: "%" as const,
            x: (adjusted.x / img.naturalWidth) * 100,
            y: (adjusted.y / img.naturalHeight) * 100,
            width: (adjusted.width / img.naturalWidth) * 100,
            height: (adjusted.height / img.naturalHeight) * 100,
          };
          saveCurrentStateToHistory();
          setCrop(newPercent);
          setCompletedCrop(adjusted);
          setPreviewCrop(undefined);
          requestAnimationFrame(() => forceCanvasUpdate());
          return;
        }
      }

      requestAnimationFrame(() => {
        const img = imgRef.current;
        if (!img) return;
        const imageAspectRatio = img.naturalWidth / img.naturalHeight;
        let cropWidth: number, cropHeight: number, cropX: number, cropY: number;
        if (aspectRatio > imageAspectRatio) {
          cropWidth = 100;
          cropHeight = (100 * imageAspectRatio) / aspectRatio;
          cropX = 0;
          cropY = (100 - cropHeight) / 2;
        } else {
          cropHeight = 100;
          cropWidth = (100 * aspectRatio) / imageAspectRatio;
          cropX = (100 - cropWidth) / 2;
          cropY = 0;
        }
        const newCrop = {
          unit: "%" as const,
          width: cropWidth,
          height: cropHeight,
          x: cropX,
          y: cropY,
        };
        saveCurrentStateToHistory();
        setCrop(newCrop);
        setCompletedCrop(undefined);
        forceCanvasUpdate();
      });
    },
    [
      completedCrop,
      crop,
      forceCanvasUpdate,
      resetPreviewTransform,
      setPreviewCrop,
      saveCurrentStateToHistory,
    ],
  );

  // Handlers externos para ReactCrop
  const handleCropChange = useCallback((_: PixelCrop, percentCrop: Crop) => {
    setCrop(percentCrop);
  }, []);

  const handleCropComplete = useCallback(
    (c: Crop) => {
      const img = imgRef.current;
      const canvas = previewCanvasRef.current;
      if (img && canvas && img.naturalWidth && img.naturalHeight) {
        const rect = canvas.getBoundingClientRect();
        // El canvas puede estar escalado por CSS (zoom). Corregimos ese factor.
        const currentZoom = getPreviewTransform().zoom ?? 1;
        const renderedWidth = rect.width / currentZoom;
        const renderedHeight = rect.height / currentZoom;

        const scaleX = img.naturalWidth / renderedWidth;
        const scaleY = img.naturalHeight / renderedHeight;

        const pixelCrop = convertToPixelCrop(c, renderedWidth, renderedHeight);
        const finalPx = {
          x: pixelCrop.x * scaleX,
          y: pixelCrop.y * scaleY,
          width: pixelCrop.width * scaleX,
          height: pixelCrop.height * scaleY,
          unit: "px" as const,
        };
        saveCurrentStateToHistory();
        setCompletedCrop(finalPx);
      }
    },
    [getPreviewTransform, previewCanvasRef, saveCurrentStateToHistory],
  );

  const handleSave = useCallback(async () => {
    let cropArea:
      | { x: number; y: number; width: number; height: number }
      | undefined;

    if (selectedAspectRatio !== undefined && imgRef.current) {
      let finalCompleted = completedCrop;
      if (!finalCompleted && crop && previewCanvasRef.current) {
        const rect = previewCanvasRef.current.getBoundingClientRect();
        const renderedWidth = rect.width;
        const renderedHeight = rect.height;
        const pixelCrop = convertToPixelCrop(
          crop,
          renderedWidth,
          renderedHeight,
        );
        const scaleX = imgRef.current.naturalWidth / renderedWidth;
        const scaleY = imgRef.current.naturalHeight / renderedHeight;
        finalCompleted = {
          x: pixelCrop.x * scaleX,
          y: pixelCrop.y * scaleY,
          width: pixelCrop.width * scaleX,
          height: pixelCrop.height * scaleY,
          unit: "px",
        } as PixelCrop;
        setCompletedCrop(finalCompleted);
      }
      if (finalCompleted) {
        cropArea = {
          x: Math.round(finalCompleted.x),
          y: Math.round(finalCompleted.y),
          width: Math.round(finalCompleted.width),
          height: Math.round(finalCompleted.height),
        };
      }
    }

    try {
      const result = await exportImage(cropArea);
      if (result) {
        onSave(result, filters, {
          aspectRatio: selectedAspectRatio,
          crop: cropArea,
        });
      } else {
        console.error("Error: No se pudo exportar la imagen");
      }
    } catch (error) {
      console.error("Error al guardar la imagen:", error);
    }
  }, [
    completedCrop,
    crop,
    exportImage,
    filters,
    onSave,
    previewCanvasRef,
    selectedAspectRatio,
  ]);

  // Setter plano SIN guardar estado antes - el efecto se encarga
  const setFiltersPlain = useCallback(
    (next: FilterSettings) => {
      setFilters(next);
    },
    [setFilters],
  );

  // Reset total
  const handleResetAll = useCallback(() => {
    // Guardar estado actual ANTES del reset al history
    saveCurrentStateToHistory();

    // Aplicar reset
    resetFilters();
    setSelectedAspectRatio(undefined);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewCrop(undefined);
    resetPreviewTransform();

    requestAnimationFrame(() => {
      forceCanvasUpdate();
    });
  }, [
    saveCurrentStateToHistory,
    resetFilters,
    resetPreviewTransform,
    setPreviewCrop,
    forceCanvasUpdate,
  ]);
  const resetFilterWithHistory = useCallback(
    (name: keyof FilterSettings) => {
      saveCurrentStateToHistory();
      resetFilter(name);
    },
    [resetFilter, saveCurrentStateToHistory],
  );

  const commitHistorySoon = useCallback(() => {
    // Ya no necesitamos esta función porque el history se guarda inmediatamente
  }, []);

  return {
    // UI/state
    activeTab,
    handleTabChange,
    imgRef,
    crop,
    completedCrop,
    selectedAspectRatio,
    setSelectedAspectRatio,
    onImageLoad,
    handleAspectRatioChange,
    handleCropChange,
    handleCropComplete,
    handleSave,
    handleResetAll,
    commitHistorySoon,
    undo,
    redo,
    canUndo,
    canRedo,

    // Filters/canvas
    filters,
    setFilters: setFiltersPlain,
    originalImage,
    previewCanvasRef,
    resetFilter: resetFilterWithHistory,
    isFilterModified,
    setPreviewTransform,
    resetPreviewTransform,
    getPreviewTransform,
    previewTransformVersion,
  } as const;
};
