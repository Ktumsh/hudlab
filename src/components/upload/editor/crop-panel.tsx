import { useRef } from "react";

import AspectRatioIcon from "./aspect-ratio-icon";
import DraggableScroll, {
  type DraggableScrollHandle,
} from "./draggable-scroll";

import { Button } from "@/components/ui/button";
import { ASPECT_RATIOS } from "@/data/aspect-ratios";
import { cn } from "@/lib";

interface CropPanelProps {
  selectedAspectRatio: number | undefined;
  handleAspectRatioChange: (aspectRatio: number | undefined) => void;
}

export default function CropPanel({
  selectedAspectRatio,
  handleAspectRatioChange,
}: CropPanelProps) {
  const scrollRef = useRef<DraggableScrollHandle>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const ratios = ASPECT_RATIOS;
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const idx = Math.max(
      0,
      ratios.findIndex((r) => r.value === selectedAspectRatio),
    );
    const nextIdx = Math.min(ratios.length - 1, Math.max(0, idx + dir));
    const next = ratios[nextIdx];
    if (next) {
      handleAspectRatioChange(next.value);
      const key = String(next.value ?? "free");
      const el = buttonRefs.current[key];
      if (el) scrollRef.current?.ensureVisible(el, 24);
    }
  };
  return (
    <DraggableScroll ref={scrollRef}>
      <div className="flex space-x-2 pr-16" tabIndex={0} onKeyDown={onKeyDown}>
        {ratios.map((ratio) => {
          const isSelected = selectedAspectRatio === ratio.value;
          return (
            <Button
              key={ratio.name}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className={cn(isSelected && "text-neutral-content")}
              ref={(el) => {
                const key = String(ratio.value ?? "free");
                buttonRefs.current[key] = el;
              }}
              onClick={() => {
                if (scrollRef.current?.isDragging?.()) return;
                handleAspectRatioChange(ratio.value);
                const key = String(ratio.value ?? "free");
                const el = buttonRefs.current[key];
                if (el) scrollRef.current?.ensureVisible(el, 24);
              }}
            >
              <AspectRatioIcon ratio={ratio.value} />
              {ratio.name}
            </Button>
          );
        })}
      </div>
    </DraggableScroll>
  );
}
