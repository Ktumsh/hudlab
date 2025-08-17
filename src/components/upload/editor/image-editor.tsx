"use client";

import "react-image-crop/dist/ReactCrop.css";
import {
  IconAdjustments,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCrop,
  IconFilters,
  IconMinus,
  IconPlus,
  IconRestore,
} from "@tabler/icons-react";
import { LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import ReactCrop from "react-image-crop";

import ControlsPanel from "./controls-panel";
import { PanZoomStage } from "./pan-zoom-stage";

import type { FilterSettings } from "@/hooks/use-image-filters";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { BetterTooltip } from "@/components/ui/tooltip";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useImageEditor } from "@/hooks/use-image-editor";
import { cn } from "@/lib";

const zoomPresets = [
  { value: "25", label: "25%" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "90", label: "90%" },
  { value: "100", label: "100%", subLabel: "Tamaño real" },
  { value: "110", label: "110%" },
  { value: "125", label: "125%" },
  { value: "150", label: "150%" },
  { value: "200", label: "200%" },
  { value: "300", label: "300%" },
  { value: "400", label: "400%" },
  { value: "600", label: "600%" },
  { value: "800", label: "800%" },
  { value: "1600", label: "1600%" },
];

interface ImageEditorProps {
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

export default function ImageEditor({
  imageUrl,
  initialFilters,
  initialAspectRatio,
  initialCrop,
  onSave,
}: ImageEditorProps) {
  const {
    // estado/control
    activeTab,
    handleTabChange,
    imgRef,
    crop,
    selectedAspectRatio,
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
    // filtros/canvas
    filters,
    setFilters,
    originalImage,
    previewCanvasRef,
    resetFilter,
    isFilterModified,
    setPreviewTransform,
    getPreviewTransform,
  } = useImageEditor({
    imageUrl,
    initialFilters,
    initialAspectRatio,
    initialCrop,
    onSave,
  });

  // Scoping de rueda: activar zoom de imagen al interactuar con el canvas,
  // desactivarlo al entrar en el panel de controles para que la rueda mueva sliders.
  const [wheelZoomEnabled, setWheelZoomEnabled] = useState(true);

  // Derivar zoom y forzar actualización de valor cuando el transform cambie
  const zoomPct = Math.round((getPreviewTransform().zoom ?? 1) * 100);
  const computeFitZoom = useCallback(() => {
    // Calcular "Ajustar a vista" usando el canvas renderizado vs su contenedor
    const canvas = previewCanvasRef.current;
    if (!canvas) return 100;
    const rect = canvas.getBoundingClientRect();
    // El canvas ya está ajustado por altura fija; fit ~= 100%
    // Dejamos hook para futuras adaptaciones por si cambia layout
    const fit = Math.round((rect.height / rect.height) * 100);
    return Number.isFinite(fit) && fit > 0 ? fit : 100;
  }, [previewCanvasRef]);

  // Hotkeys: undo/redo + zoom (Ctrl + rueda en hook) + +/-
  useHotkeys({
    onUndo: undo,
    onRedo: redo,
    onZoomIn: () => {
      const t = getPreviewTransform();
      setPreviewTransform({ zoom: Math.min(8, (t.zoom ?? 1) * 1.06) });
      commitHistorySoon();
    },
    onZoomOut: () => {
      const t = getPreviewTransform();
      setPreviewTransform({ zoom: Math.max(0.5, (t.zoom ?? 1) / 1.06) });
      commitHistorySoon();
    },
  });

  // Handlers no-inline para tabs
  const handleClickFiltersTab = useCallback(
    () => handleTabChange("filters"),
    [handleTabChange],
  );
  const handleClickAdjustmentsTab = useCallback(
    () => handleTabChange("adjustments"),
    [handleTabChange],
  );
  const handleClickCropTab = useCallback(
    () => handleTabChange("crop"),
    [handleTabChange],
  );

  // Zoom handlers no-inline
  const handleZoomChange = useCallback(
    (z: number) => {
      setPreviewTransform({ zoom: z });
      commitHistorySoon();
    },
    [setPreviewTransform, commitHistorySoon],
  );

  const handleZoomIn = useCallback(() => {
    const t = getPreviewTransform();
    setPreviewTransform({ zoom: Math.min(8, (t.zoom ?? 1) * 1.06) });
    commitHistorySoon();
  }, [getPreviewTransform, setPreviewTransform, commitHistorySoon]);

  const handleZoomOut = useCallback(() => {
    const t = getPreviewTransform();
    setPreviewTransform({ zoom: Math.max(0.5, (t.zoom ?? 1) / 1.06) });
    commitHistorySoon();
  }, [getPreviewTransform, setPreviewTransform, commitHistorySoon]);

  const handleResetAllClick = useCallback(
    () => handleResetAll(),
    [handleResetAll],
  );
  const handleZoomPreset = useCallback(
    (value: string) => {
      let pct: number | null = null;
      if (value === "fit") pct = computeFitZoom();
      else if (value === "100") pct = 100;
      else {
        const parsed = parseInt(value, 10);
        pct = Number.isNaN(parsed) ? null : parsed;
      }
      if (pct != null) {
        setPreviewTransform({
          zoom: Math.max(0.5, Math.min(8, pct / 100)),
        });
        commitHistorySoon();
      }
    },
    [computeFitZoom, setPreviewTransform, commitHistorySoon],
  );

  const handleUndoClick = useCallback(() => undo(), [undo]);
  const handleRedoClick = useCallback(() => redo(), [redo]);
  const handleSaveClick = useCallback(() => handleSave(), [handleSave]);

  return (
    <div className="transform-gpu backface-hidden">
      <div className="flex grow flex-col overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <Button
            title="Revertir"
            size="icon-sm"
            outline
            onClick={handleResetAllClick}
            aria-label="Revertir"
          >
            <IconRestore />
          </Button>
          <div className="flex gap-2">
            <div className="rounded-field flex overflow-hidden">
              <Button
                title="Alejar"
                size="icon"
                outline
                onClick={handleZoomOut}
                aria-label="Zoom out"
                className="rounded-none border-r-0"
              >
                <IconMinus />
              </Button>
              <Select
                onValueChange={handleZoomPreset}
                onOpenChange={(open) => setWheelZoomEnabled(!open)}
              >
                <SelectTrigger
                  title="Zoom"
                  size="sm"
                  hideChevron
                  className="focus:border-border h-8 justify-center rounded-none py-0 focus:ring-0! focus:outline-none!"
                >
                  <span className="text-xs">{zoomPct}%</span>
                </SelectTrigger>
                <SelectContent className="min-w-auto *:[--radix-select-trigger-width:auto]!">
                  {zoomPresets.map(({ value, label, subLabel }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      hideIndicator
                      className="h-auto px-2 text-xs"
                    >
                      {subLabel ? (
                        <div className="flex flex-col">
                          <span>{label}</span>
                          <span className="text-xxs text-content-muted">
                            {subLabel}
                          </span>
                        </div>
                      ) : (
                        label
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                title="Acercar"
                size="icon"
                outline
                onClick={handleZoomIn}
                aria-label="Zoom in"
                className="rounded-none border-l-0"
              >
                <IconPlus />
              </Button>
            </div>
            <div className="rounded-field grid grid-cols-2 overflow-hidden">
              <Button
                title="Deshacer"
                size="icon"
                outline
                disabled={!canUndo()}
                onClick={handleUndoClick}
                aria-label="Deshacer"
                className="rounded-none border-r-0"
              >
                <IconArrowBackUp />
              </Button>
              <Button
                title="Rehacer"
                size="icon"
                outline
                disabled={!canRedo()}
                onClick={handleRedoClick}
                aria-label="Rehacer"
                className="rounded-none"
              >
                <IconArrowForwardUp />
              </Button>
            </div>
          </div>
          <Button size="sm" variant="primary" onClick={handleSaveClick}>
            Guardar
          </Button>
        </div>

        {/* Image Preview */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-4">
          <div
            className="relative max-h-full max-w-full touch-none"
            onMouseEnter={() => setWheelZoomEnabled(true)}
          >
            <PanZoomStage
              enabled={true}
              zoom={getPreviewTransform().zoom ?? 1}
              onZoomChange={handleZoomChange}
              enablePan={activeTab !== "crop"}
              enableWheelZoom={wheelZoomEnabled}
              // Altura estable del escenario para evitar salto inicial
              className="relative max-h-full min-h-[420px] max-w-full touch-none"
            >
              {/* Hidden image for loading and crop calculations */}
              <Image
                ref={imgRef}
                src={imageUrl}
                alt="Source image"
                width={800}
                height={800}
                onLoad={onImageLoad}
                className="hidden"
              />

              {activeTab === "crop" && selectedAspectRatio !== undefined ? (
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={handleCropComplete}
                  aspect={selectedAspectRatio}
                  minWidth={50}
                  minHeight={50}
                  className="relative inline-block"
                >
                  <canvas
                    ref={previewCanvasRef}
                    className="h-full max-h-full w-auto max-w-full object-contain"
                  />
                </ReactCrop>
              ) : (
                <canvas
                  ref={previewCanvasRef}
                  className="h-full max-h-full w-auto max-w-full object-contain"
                />
              )}
            </PanZoomStage>
          </div>
        </div>
        <div className="bg-base-100/80 relative z-1">
          <div
            onMouseEnter={() => setWheelZoomEnabled(false)}
            onMouseLeave={() => setWheelZoomEnabled(true)}
          >
            <ControlsPanel
              activeTab={activeTab}
              originalImage={originalImage}
              imageUrl={imageUrl}
              filters={filters}
              setFilters={setFilters}
              resetFilter={resetFilter}
              isFilterModified={isFilterModified}
              handleAspectRatioChange={handleAspectRatioChange}
              selectedAspectRatio={selectedAspectRatio}
              commitHistorySoon={commitHistorySoon}
            />
          </div>
          <div className="relative z-1 my-3 flex justify-center">
            <div className="flex space-x-2 px-4">
              <Button
                outline={activeTab !== "crop"}
                onClick={handleClickCropTab}
                className="h-16 w-20 flex-col gap-1 px-0 text-xs font-normal"
              >
                <IconCrop />
                Recortar
              </Button>
              <Button
                outline={activeTab !== "adjustments"}
                onClick={handleClickAdjustmentsTab}
                className="h-16 w-20 flex-col gap-1 px-0 text-xs font-normal"
              >
                <IconAdjustments />
                Ajustes
              </Button>
              <Button
                outline={activeTab !== "filters"}
                onClick={handleClickFiltersTab}
                className="h-16 w-20 flex-col gap-1 px-0 text-xs font-normal"
              >
                <IconFilters />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
