"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseExpandableTextOptions {
  /**
   * Altura máxima en píxeles cuando el texto está colapsado
   * @default 128
   */
  collapsedHeight?: number;
  /**
   * Altura máxima en píxeles cuando el texto está expandido
   * @default undefined (sin límite)
   */
  expandedMaxHeight?: number;
  /**
   * Tolerancia en píxeles para determinar si se necesita el botón expandir
   * @default 10
   */
  tolerance?: number;
}

interface UseExpandableTextReturn {
  /**
   * Referencia para el elemento del contenido
   */
  contentRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Si el texto está actualmente expandido
   */
  isExpanded: boolean;
  /**
   * Si se debe mostrar el botón de expandir/contraer
   */
  showExpandButton: boolean;
  /**
   * Altura actual del contenido
   */
  contentHeight: number;
  /**
   * Función para alternar entre expandido/colapsado
   */
  toggleExpanded: () => void;
  /**
   * Función para expandir el contenido
   */
  expand: () => void;
  /**
   * Función para colapsar el contenido
   */
  collapse: () => void;
}

/**
 * Hook para gestionar texto expandible con "mostrar más/menos"
 */
export const useExpandableText = (
  content: string | null | undefined,
  options: UseExpandableTextOptions = {},
): UseExpandableTextReturn => {
  const { collapsedHeight = 128, expandedMaxHeight, tolerance = 10 } = options;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Medir el contenido y determinar si necesita expansión
  const measureContent = useCallback(() => {
    if (!contentRef.current || !content) {
      setShowExpandButton(false);
      return;
    }

    const element = contentRef.current;

    // Temporalmente remover restricciones de altura para medir el contenido real
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;

    element.style.maxHeight = "none";
    element.style.overflow = "visible";

    const scrollHeight = element.scrollHeight;

    // Restaurar estilos originales
    element.style.maxHeight = originalMaxHeight;
    element.style.overflow = originalOverflow;

    setContentHeight(scrollHeight);
    setShowExpandButton(scrollHeight > collapsedHeight + tolerance);
  }, [content, collapsedHeight, tolerance]);

  // Remedir cuando cambie el contenido
  useEffect(() => {
    measureContent();
  }, [measureContent]);

  // Remedir cuando el DOM esté listo
  useEffect(() => {
    const timer = setTimeout(measureContent, 0);
    return () => clearTimeout(timer);
  }, [measureContent]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // Calcular la altura objetivo para la animación
  const targetHeight = isExpanded
    ? expandedMaxHeight
      ? Math.min(contentHeight, expandedMaxHeight)
      : contentHeight
    : collapsedHeight;

  return {
    contentRef,
    isExpanded,
    showExpandButton,
    contentHeight: targetHeight,
    toggleExpanded,
    expand,
    collapse,
  };
};
