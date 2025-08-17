"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

import DraggableScroll, {
  type DraggableScrollHandle,
} from "./draggable-scroll";

import { PrettySlider } from "@/components/icons/pretty-slider";
import { Button } from "@/components/ui/button";
import { type FilterSettings } from "@/hooks/use-image-filters";
import { cn } from "@/lib";
import { clamp, applyOvershootResistance } from "@/lib/editor";

interface AdjustmentsPanelProps {
  filters: FilterSettings;
  setFilters: (filters: FilterSettings) => void;
  resetFilter: (filter: keyof FilterSettings) => void;
  isFilterModified: (filter: keyof FilterSettings) => boolean;
  commitHistorySoon?: () => void;
}

type AdjustmentType = keyof Pick<
  FilterSettings,
  | "brightness"
  | "contrast"
  | "saturation"
  | "exposure"
  | "gamma"
  | "clarity"
  | "temperature"
  | "vignette"
>;

const ADJUSTMENTS: Array<{
  key: AdjustmentType;
  name: string;
}> = [
  { key: "brightness", name: "Brillo" },
  { key: "contrast", name: "Contraste" },
  { key: "saturation", name: "Saturación" },
  { key: "exposure", name: "Exposición" },
  { key: "gamma", name: "Gamma" },
  { key: "clarity", name: "Claridad" },
  { key: "temperature", name: "Temperatura" },
  { key: "vignette", name: "Viñeta" },
];

export default function AdjustmentsPanel({
  filters,
  setFilters,
  resetFilter,
  isFilterModified,
  commitHistorySoon,
}: AdjustmentsPanelProps) {
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<AdjustmentType>("brightness");
  const tabsScrollRef = useRef<DraggableScrollHandle>(null);
  const tabsWrapRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<AdjustmentType, HTMLButtonElement | null>>({
    brightness: null,
    contrast: null,
    saturation: null,
    exposure: null,
    gamma: null,
    clarity: null,
    temperature: null,
    vignette: null,
  });

  // Estado para slider personalizado
  const maskRef = useRef<HTMLDivElement>(null);
  const [maskWidth, setMaskWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; value: number } | null>(null);
  const [visualValue, setVisualValue] = useState<number>(
    filters["brightness"] ?? 0,
  );

  // Sincronizar el valor visual con el filtro activo cuando NO estamos arrastrando
  useEffect(() => {
    if (!isDragging) {
      setVisualValue(filters[selectedAdjustment]);
    }
  }, [filters, selectedAdjustment, isDragging]);

  // Observar ancho del área interactiva
  useEffect(() => {
    const el = maskRef.current;
    if (!el) return;
    const update = () => setMaskWidth(el.clientWidth || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedAdjustment]);

  const handleAdjustmentSelect = (adjustment: AdjustmentType) => {
    setSelectedAdjustment(adjustment);
  };

  // Reiniciar estado de arrastre al cambiar de ajuste
  useEffect(() => {
    setIsDragging(false);
    dragStart.current = null;
    // Tras seleccionar un ajuste, enfocar el slider para capturar rueda/teclas
    if (maskRef.current) {
      maskRef.current.focus();
    }
  }, [selectedAdjustment]);

  const valueToPx = (value: number) => {
    if (maskWidth <= 0) return 0;
    // Mapea [-100,100] a [-maskWidth/2, maskWidth/2]
    return (-maskWidth * value) / 200;
  };

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if not supported
    }
    const clientX = e.clientX;
    dragStart.current = {
      x: clientX,
      value: filters[selectedAdjustment],
    };
    setVisualValue(filters[selectedAdjustment]);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || maskWidth === 0) return;
    const clientX = e.clientX;
    const dx = clientX - dragStart.current.x;
    // Hacia la izquierda (dx negativo) suma valor, hacia la derecha resta
    const dv = (-dx / (maskWidth / 2)) * 100;
    const raw = dragStart.current.value + dv;
    const resisted = applyOvershootResistance(raw, -100, 100);
    setVisualValue(resisted);
    // Actualiza el filtro con el valor clamp(redondeado) solo si cambia
    const v = Math.round(clamp(raw, -100, 100));
    if (filters[selectedAdjustment] !== v) {
      setFilters({ ...filters, [selectedAdjustment]: v });
    }
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if not supported
    }
    if (!dragStart.current) return;
    // Asegura que el valor final quede clamp y con spring visual suave
    const finalValue = Math.round(clamp(visualValue, -100, 100));
    if (filters[selectedAdjustment] !== finalValue) {
      setFilters({ ...filters, [selectedAdjustment]: finalValue });
    }
    setVisualValue(finalValue);
    dragStart.current = null;
    commitHistorySoon?.();
  };

  // Rueda del mouse sobre el slider: ajustar valor suavemente
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!maskRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    // Usar el eje dominante (Y si existe, si no X) para soportar trackpads
    const dominant =
      Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (!dominant) return;
    const step = dominant < 0 ? 2 : -2;
    const v = clamp(filters[selectedAdjustment] + step, -100, 100);
    if (v !== filters[selectedAdjustment]) {
      setFilters({ ...filters, [selectedAdjustment]: v });
      setVisualValue(v);
      commitHistorySoon?.();
    }
  };

  // Rueda a nivel de panel: si el cursor está sobre las pestañas, delegar en el carrusel;
  // en caso contrario, ajustar el slider activo.
  const onPanelWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const target = e.target as Node | null;
    if (target && tabsWrapRef.current && tabsWrapRef.current.contains(target)) {
      // dentro de pestañas: que DraggableScroll maneje la rueda
      return;
    }
    // fuera de pestañas: dirigir al slider
    onWheel(e);
  };

  // Flechas del teclado cuando el control tiene foco
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const v = clamp(filters[selectedAdjustment] + delta, -100, 100);
    if (v !== filters[selectedAdjustment]) {
      setFilters({ ...filters, [selectedAdjustment]: v });
      setVisualValue(v);
      commitHistorySoon?.();
    }
  };

  // Navegación por tabs de ajustes con flechas cuando el foco está en el carrusel de tabs
  const onTabsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const idx = ADJUSTMENTS.findIndex((a) => a.key === selectedAdjustment);
    const nextIdx = clamp(idx + dir, 0, ADJUSTMENTS.length - 1);
    const next = ADJUSTMENTS[nextIdx];
    if (next) {
      setSelectedAdjustment(next.key);
      const el = tabRefs.current[next.key];
      if (el) tabsScrollRef.current?.ensureVisible(el, 24);
    }
  };

  return (
    <div onWheel={onPanelWheel}>
      <AnimatePresence mode="popLayout">
        {selectedAdjustment && (
          <motion.div
            key={selectedAdjustment}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex">
              {/* Slider personalizado con arrastre horizontal y efecto elástico */}
              <div className="relative mx-auto flex h-14 touch-none flex-col items-center select-none">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">
                  {Math.round(filters[selectedAdjustment])}
                </span>
                <button
                  disabled={!isFilterModified(selectedAdjustment)}
                  className={cn(
                    "after:bg-base-content text-neutral-content pointer-events-none absolute top-0 bottom-auto left-1/2 z-10 h-5 w-6 -translate-x-1/2 opacity-15 transition-opacity after:absolute after:top-1/5 after:left-1/2 after:block after:h-3/5 after:w-px hover:opacity-50",
                    isFilterModified(selectedAdjustment) &&
                      "pointer-events-auto opacity-35",
                  )}
                  onClick={() => resetFilter(selectedAdjustment)}
                >
                  <span className="sr-only">Restablecer</span>
                </button>
                <motion.div
                  ref={maskRef}
                  className="slider-mask relative w-full max-w-md min-w-60 overflow-hidden"
                  tabIndex={0}
                  onPointerDown={handleDragStart}
                  onPointerMove={(e) => {
                    if (isDragging) {
                      e.preventDefault();
                      handleDragMove(e);
                    }
                  }}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                  onWheel={onWheel}
                  onKeyDown={onKeyDown}
                >
                  <motion.div
                    className="pointer-events-none"
                    animate={{ x: valueToPx(visualValue) }}
                    transition={
                      isDragging
                        ? { type: "tween", duration: 0 }
                        : { type: "spring", damping: 25, stiffness: 300 }
                    }
                  >
                    <PrettySlider />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={tabsWrapRef}>
        <DraggableScroll ref={tabsScrollRef}>
          <div
            className="flex space-x-2 pr-16"
            tabIndex={0}
            onKeyDown={onTabsKeyDown}
          >
            {ADJUSTMENTS.map((adjustment) => (
              <Button
                key={adjustment.key}
                variant={
                  selectedAdjustment === adjustment.key ? "default" : "ghost"
                }
                size="sm"
                ref={(el) => {
                  tabRefs.current[adjustment.key] = el;
                }}
                onClick={() => {
                  if (tabsScrollRef.current?.isDragging?.()) return;
                  handleAdjustmentSelect(adjustment.key);
                  const el = tabRefs.current[adjustment.key];
                  if (el) tabsScrollRef.current?.ensureVisible(el, 24);
                }}
                className="relative"
              >
                <span className="font-medium whitespace-nowrap">
                  {adjustment.name}
                </span>
                {isFilterModified(adjustment.key) && (
                  <div className="bg-primary absolute top-0.5 right-0.5 size-2 rounded-full" />
                )}
              </Button>
            ))}
          </div>
        </DraggableScroll>
      </div>
    </div>
  );
}
