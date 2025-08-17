import { useMemo, useRef, useState } from "react";

import DraggableScroll, {
  type DraggableScrollHandle,
} from "./draggable-scroll";
import PresetThumbnail from "./preset-thumbnail";

import { FILTER_PRESETS } from "@/data/filter-presets";
import {
  DEFAULT_FILTERS,
  type FilterSettings,
} from "@/hooks/use-image-filters";

interface FiltersPanelProps {
  originalImage: HTMLImageElement | null;
  imageUrl: string;
  setFilters: (filters: FilterSettings) => void;
  filters?: FilterSettings;
  commitHistorySoon?: () => void;
}

const FiltersPanel = ({
  originalImage,
  imageUrl,
  setFilters,
  filters,
  commitHistorySoon,
}: FiltersPanelProps) => {
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const scrollRef = useRef<DraggableScrollHandle>(null);
  const presets = FILTER_PRESETS;
  const currentIndex = useMemo(() => {
    // Heurística: si filtros coincide exactamente con algún preset, devuelve ese índice
    if (!filters) return -1;
    return presets.findIndex((p) => {
      const f = { ...DEFAULT_FILTERS, ...p.filters } as FilterSettings;
      const keys = Object.keys(f) as Array<keyof FilterSettings>;
      return keys.every((k) => filters[k] === f[k]);
    });
  }, [filters, presets]);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const base =
      focusIndex >= 0 ? focusIndex : currentIndex >= 0 ? currentIndex : 0;
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.min(presets.length - 1, Math.max(0, base + dir));
    setFocusIndex(nextIndex);
    const preset = presets[nextIndex];
    if (preset) {
      setFilters({ ...DEFAULT_FILTERS, ...preset.filters });
      commitHistorySoon?.();
    }
    // Asegurar visibilidad del item activo
    const el = itemRefs.current[nextIndex];
    if (el) scrollRef.current?.ensureVisible(el, 24);
  };

  return (
    <DraggableScroll ref={scrollRef}>
      <div
        className="flex items-center gap-4 pr-4"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="rounded-box flex gap-px overflow-hidden">
          {FILTER_PRESETS.slice(0, 1).map((preset, i) => (
            <div
              key={preset.name}
              className="flex-none"
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[0 + i] = el;
              }}
              onMouseDown={() => {
                const el = itemRefs.current[0 + i];
                if (el) scrollRef.current?.ensureVisible(el, 24);
              }}
            >
              <PresetThumbnail
                presetName={preset.name}
                filters={preset.filters}
                originalImage={originalImage}
                imageUrl={imageUrl}
                onClick={() => {
                  // Evitar seleccionar si fue drag del carrusel
                  if (scrollRef.current?.isDragging?.()) return;
                  setFilters({ ...DEFAULT_FILTERS, ...preset.filters });
                  commitHistorySoon?.();
                }}
              />
            </div>
          ))}
        </div>
        <div className="rounded-box flex gap-px overflow-hidden">
          {FILTER_PRESETS.slice(1, 6).map((preset, i) => (
            <div
              key={preset.name}
              className="flex-none"
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[1 + i] = el;
              }}
              onMouseDown={() => {
                const el = itemRefs.current[1 + i];
                if (el) scrollRef.current?.ensureVisible(el, 24);
              }}
            >
              <PresetThumbnail
                presetName={preset.name}
                filters={preset.filters}
                originalImage={originalImage}
                imageUrl={imageUrl}
                onClick={() => {
                  if (scrollRef.current?.isDragging?.()) return;
                  const finalFilters = {
                    ...DEFAULT_FILTERS,
                    ...preset.filters,
                  };
                  setFilters(finalFilters);
                  commitHistorySoon?.();
                }}
              />
            </div>
          ))}
        </div>
        <div className="rounded-box flex gap-px overflow-hidden">
          {FILTER_PRESETS.slice(6, 10).map((preset, i) => (
            <div
              key={preset.name}
              className="flex-none"
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[6 + i] = el;
              }}
              onMouseDown={() => {
                const el = itemRefs.current[6 + i];
                if (el) scrollRef.current?.ensureVisible(el, 24);
              }}
            >
              <PresetThumbnail
                presetName={preset.name}
                filters={preset.filters}
                originalImage={originalImage}
                imageUrl={imageUrl}
                onClick={() => {
                  if (scrollRef.current?.isDragging?.()) return;
                  const finalFilters = {
                    ...DEFAULT_FILTERS,
                    ...preset.filters,
                  };
                  setFilters(finalFilters);
                  commitHistorySoon?.();
                }}
              />
            </div>
          ))}
        </div>
        <div className="rounded-box flex gap-px overflow-hidden">
          {FILTER_PRESETS.slice(10).map((preset, i) => (
            <div
              key={preset.name}
              className="flex-none"
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[10 + i] = el;
              }}
              onMouseDown={() => {
                const el = itemRefs.current[10 + i];
                if (el) scrollRef.current?.ensureVisible(el, 24);
              }}
            >
              <PresetThumbnail
                presetName={preset.name}
                filters={preset.filters}
                originalImage={originalImage}
                imageUrl={imageUrl}
                onClick={() => {
                  if (scrollRef.current?.isDragging?.()) return;
                  const finalFilters = {
                    ...DEFAULT_FILTERS,
                    ...preset.filters,
                  };
                  setFilters(finalFilters);
                  commitHistorySoon?.();
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </DraggableScroll>
  );
};

export default FiltersPanel;
