"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { clamp } from "@/lib/editor";

export interface PanZoomStageProps {
  enabled: boolean; // desactivar en crop si lo maneja ReactCrop
  zoom: number;
  onZoomChange: (z: number) => void;
  maxPan?: number; // píxeles de pan máximo desde el centro
  enablePan?: boolean; // permite arrastrar (pan)
  enableWheelZoom?: boolean; // permite zoom con rueda
  enablePinchZoom?: boolean; // permite zoom con gesto pinch (táctil)
  className?: string;
  children: React.ReactNode; // canvas o react-crop con canvas dentro
}

export function PanZoomStage({
  enabled,
  zoom,
  onZoomChange,
  maxPan = 100,
  enablePan = true,
  enableWheelZoom = true,
  enablePinchZoom = true,
  className,
  children,
}: PanZoomStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPinching, setIsPinching] = useState(false);

  // Motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Springs para pan elástico de corto alcance
  const springX = useSpring(rawX, { stiffness: 450, damping: 36 });
  const springY = useSpring(rawY, { stiffness: 450, damping: 36 });

  // Zoom animado con spring
  const zoomMv = useMotionValue(zoom);
  const zoomSpring = useSpring(zoomMv, { stiffness: 220, damping: 30 });

  useEffect(() => {
    zoomMv.set(zoom);
  }, [zoom, zoomMv]);

  // Pinch handlers (sin inline en JSX) — pan ahora lo gestiona Motion drag
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef<number>(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;
    const onDown = (e: PointerEvent) => {
      if (!enabled) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (enablePinchZoom && pointers.current.size === 2) {
        // iniciar pinch
        const [a, b] = Array.from(pointers.current.values());
        pinchStartDistance.current = Math.hypot(b.x - a.x, b.y - a.y);
        pinchStartZoom.current = zoomMv.get();
        setIsPinching(true);
      } else {
        // Pan lo gestiona Motion drag
      }
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!enabled) return;
      if (
        enablePinchZoom &&
        pointers.current.size >= 2 &&
        pinchStartDistance.current
      ) {
        // actualizar pinch
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const vals = Array.from(pointers.current.values()).slice(0, 2);
        const dist = Math.hypot(vals[1].x - vals[0].x, vals[1].y - vals[0].y);
        const scale = dist / pinchStartDistance.current;
        const next = clamp(pinchStartZoom.current * scale, 0.5, 8);
        e.preventDefault();
        onZoomChange(next);
        return;
      }
      // Pan ignorado aquí — lo gestiona Motion drag
    };
    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) {
        pinchStartDistance.current = null;
        setIsPinching(false);
      }
      try {
        el.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
      // Pan volverá al origen con dragSnapToOrigin de Motion
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [
    enabled,
    enablePan,
    enablePinchZoom,
    maxPan,
    onZoomChange,
    rawX,
    rawY,
    zoomMv,
  ]);

  // Zoom con rueda suave (capturado aquí, no global). Requiere Ctrl? No: suave sin Ctrl.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled || !enableWheelZoom) return;
    const onWheel = (e: WheelEvent) => {
      // El contenedor es sólo el área del preview.
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1.06 : 1 / 1.06;
      const next = clamp(zoomMv.get() * dir, 0.5, 8);
      onZoomChange(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [enabled, enableWheelZoom, onZoomChange, zoomMv]);

  // Render
  return (
    <div ref={containerRef} className={className}>
      <motion.div
        style={{
          transformOrigin: "center",
          x: springX,
          y: springY,
          scale: zoomSpring,
          willChange: "transform",
          cursor: enablePan && enabled ? "grab" : "default",
        }}
        drag={enabled && enablePan && !isPinching}
        dragConstraints={{
          left: -maxPan,
          right: maxPan,
          top: -maxPan,
          bottom: maxPan,
        }}
        dragElastic={0.24}
        dragMomentum={false}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 300, bounceDamping: 28 }}
        whileDrag={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
