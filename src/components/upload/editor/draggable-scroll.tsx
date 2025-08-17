"use client";

import { animate } from "motion";
import { motion, useMotionValue } from "motion/react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib";
import { clamp } from "@/lib/editor";

export interface DraggableScrollHandle {
  scrollBy: (deltaPx: number) => void;
  ensureVisible: (el: HTMLElement, padding?: number) => void;
  isDragging?: () => boolean;
}

interface DraggableScrollProps {
  children: React.ReactNode;
  className?: string;
}

const DraggableScroll = forwardRef<DraggableScrollHandle, DraggableScrollProps>(
  ({ children, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });
    const x = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const activeAnimRef = useRef<ReturnType<typeof animate> | null>(null);

    // Nota: renderizamos `x` directamente para que el mask/opacity reaccione al instante

    // Opacidad sutil cerca de bordes (como en la versión anterior)
    const opacity = useMotionValue(1);

    // Sin efectos de opacidad/escala para mantener nitidez durante el drag

    // Actualizar variables CSS de máscara según posición
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const featherPx = 24; // tamaño de pluma en px
      el.style.setProperty("--scrollmask-feather", `${featherPx}px`);

      const rampPx = 16; // recorrido para opacidad completa
      const updateMask = (val: number) => {
        const R = constraints.right;
        // izquierda: 1 en inicio (sin feather); baja hacia 0 cuando x < 0 (aparece feather)
        const left = 1 - Math.min(Math.max(-val / rampPx, 0), 1);
        // derecha: 1 por defecto si hay overflow; baja a 0 al llegar al final (x = -R)
        const right =
          R > 0 ? 1 - Math.min(Math.max((R + val) / rampPx, 0), 1) : 0;
        el.style.setProperty("--scrollmask-left", left.toFixed(3));
        el.style.setProperty("--scrollmask-right", right.toFixed(3));
      };

      // Siempre nos suscribimos a x para no romper animaciones nativas
      updateMask(x.get());
      const unsub = x.on("change", updateMask);
      return () => {
        unsub();
      };
    }, [x, constraints.right]);

    // Actualizar opacidad según proximidad a bordes (imitando el mapeo antiguo)
    useEffect(() => {
      const R = constraints.right;
      const FADE_MIN = 0.85;
      const FADE_WIDTH = 50; // px

      const computeOpacity = (val: number) => {
        if (R <= 0) return 1;
        // Cerca del borde izquierdo, dentro de los últimos 50px [-50..0] => 0.85..1
        if (val >= -FADE_WIDTH && val <= 0) {
          const t = (val + FADE_WIDTH) / FADE_WIDTH; // 0..1
          return FADE_MIN + t * (1 - FADE_MIN);
        }
        // Cerca/detalle del borde derecho, al sobrepasar hasta 50px [-R..-R-50] => 1..0.85
        if (val <= -R && val >= -R - FADE_WIDTH) {
          const d = -R - val; // 0..FADE_WIDTH
          return 1 - (d / FADE_WIDTH) * (1 - FADE_MIN);
        }
        // Fuera de rangos: mantener 1 (o el mínimo si se pasa más de 50px)
        if (val < -R - FADE_WIDTH) return FADE_MIN;
        return 1;
      };

      const updateOpacity = (val: number) => opacity.set(computeOpacity(val));
      // Nos suscribimos a x siempre
      updateOpacity(x.get());
      const unsub = x.on("change", updateOpacity);
      return () => unsub();
    }, [x, opacity, constraints.right]);

    useEffect(() => {
      const updateConstraints = () => {
        if (containerRef.current) {
          const container = containerRef.current;
          const content = contentRef.current;
          if (content) {
            const containerWidth = container.offsetWidth;
            const contentWidth = content.scrollWidth;
            const maxScroll = Math.max(0, contentWidth - containerWidth);

            setConstraints({
              left: 0,
              right: maxScroll,
            });
          }
        }
      };

      updateConstraints();

      const resizeObserver = new ResizeObserver(updateConstraints);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => resizeObserver.disconnect();
    }, [children]);

    // Helper para animar x suavemente sin cambiar la fuente de style.x
    const animateTo = useCallback(
      (next: number) => {
        const min = -constraints.right;
        const max = 0;
        const clamped = clamp(next, min, max);
        // Cancelar animación previa si existe
        activeAnimRef.current?.stop?.();
        activeAnimRef.current = animate(x, clamped, {
          type: "spring",
          stiffness: 200,
          damping: 25,
        });
      },
      [constraints.right, x],
    );

    // Soporte de scroll con rueda (vertical -> horizontal)
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        if (constraints.right <= 0) return;
        // Evitar scroll de página mientras el cursor está sobre el carrusel
        e.preventDefault();
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        if (delta === 0) return;
        const current = x.get();
        const nextRaw = current - delta; // deltaY>0 desplaza a la derecha (x más negativo)
        animateTo(nextRaw);
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }, [constraints.right, animateTo, x]);

    // Exponer API imperativa: desplazar por teclado
    useImperativeHandle(ref, () => ({
      scrollBy: (deltaPx: number) => {
        if (constraints.right <= 0) return;
        const current = x.get();
        const next = current + deltaPx;
        animateTo(next);
      },
      ensureVisible: (el: HTMLElement, padding = 16) => {
        if (!containerRef.current || constraints.right <= 0) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const itemRect = el.getBoundingClientRect();
        const visibleLeft = containerRect.left + padding;
        const visibleRight = containerRect.right - padding;
        let next = x.get();
        if (itemRect.left < visibleLeft) {
          const delta = visibleLeft - itemRect.left; // mover contenido a la derecha
          next = next + delta;
        } else if (itemRect.right > visibleRight) {
          const delta = itemRect.right - visibleRight; // mover contenido a la izquierda
          next = next - delta;
        } else {
          return; // ya visible
        }
        animateTo(next);
      },
      isDragging: () => isDragging,
    }));

    // Sin manejadores manuales: dejamos que Motion gestione inercia + rebote con dragTransition

    return (
      <div
        ref={containerRef}
        className={cn(
          "mask-scroll-feather relative touch-none overflow-hidden select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]",
          className,
        )}
      >
        <motion.div
          ref={contentRef}
          className="flex"
          style={{
            x,
            opacity,
            cursor: "grab",
          }}
          drag="x"
          dragConstraints={{ left: -constraints.right, right: 0 }}
          dragElastic={0.1}
          dragMomentum={true}
          dragTransition={{
            min: -constraints.right,
            max: 0,
            bounceStiffness: 220,
            bounceDamping: 22,
          }}
          onDragStart={() => {
            // Parar cualquier animación programática al iniciar drag
            activeAnimRef.current?.stop?.();
            setIsDragging(true);
          }}
          onDragEnd={() => {
            setIsDragging(false);
          }}
          whileDrag={{
            cursor: "grabbing",
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  },
);

export default DraggableScroll;
DraggableScroll.displayName = "DraggableScroll";
