"use client";

import { useEffect, useState } from "react";

/**
 * Hook de debounce ultra simple y confiable para búsquedas
 * Sin configuraciones complejas que puedan fallar
 */
export function useSimpleSearchDebounce(
  value: string,
  delay: number = 400,
): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Limpiar timeout anterior
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
