"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Hook optimizado para debounce con múltiples opciones de configuración
 * @param value - Valor a hacer debounce
 * @param delay - Delay en milisegundos (default: 300)
 * @param options - Opciones adicionales
 */
export function useDebounce<T>(
  value: T,
  delay: number = 300,
  options?: {
    leading?: boolean; // Ejecutar inmediatamente en el primer cambio
    trailing?: boolean; // Ejecutar al final del delay (default: true)
    maxWait?: number; // Tiempo máximo de espera antes de forzar ejecución
  },
) {
  const { leading = false, trailing = true, maxWait } = options || {};

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTime = useRef<number>(0);
  const lastInvokeTime = useRef<number>(0);
  const leadingExecuted = useRef<boolean>(false);

  // Función para limpiar todos los timeouts
  const cleanup = useMemo(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
        maxTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const now = Date.now();
    lastCallTime.current = now;

    // Limpiar timeouts anteriores
    cleanup();

    // Leading edge - ejecutar inmediatamente si es la primera vez
    if (leading && !leadingExecuted.current) {
      setDebouncedValue(value);
      lastInvokeTime.current = now;
      leadingExecuted.current = true;

      // Si no hay trailing, resetear el flag después del delay
      if (!trailing) {
        timeoutRef.current = setTimeout(() => {
          leadingExecuted.current = false;
        }, delay);
      }
    }

    // Configurar timeout para trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        const timeSinceLastCall = Date.now() - lastCallTime.current;

        // Solo ejecutar si no ha habido nuevas llamadas
        if (timeSinceLastCall >= delay) {
          setDebouncedValue(value);
          lastInvokeTime.current = Date.now();
          leadingExecuted.current = false;
        }
      }, delay);
    }

    // MaxWait - forzar ejecución después de tiempo máximo
    if (maxWait && trailing) {
      const timeSinceLastInvoke = now - lastInvokeTime.current;
      const remainingWait = maxWait - timeSinceLastInvoke;

      if (remainingWait > 0) {
        maxTimeoutRef.current = setTimeout(() => {
          setDebouncedValue(value);
          lastInvokeTime.current = Date.now();
          leadingExecuted.current = false;
        }, remainingWait);
      }
    }

    // Cleanup al desmontar
    return cleanup;
  }, [value, delay, leading, trailing, maxWait, cleanup]);

  // Reset manual del debounce
  const reset = useMemo(() => {
    return () => {
      cleanup();
      setDebouncedValue(value);
      leadingExecuted.current = false;
      lastCallTime.current = 0;
      lastInvokeTime.current = 0;
    };
  }, [value, cleanup]);

  // Flush manual - ejecutar inmediatamente
  const flush = useMemo(() => {
    return () => {
      cleanup();
      setDebouncedValue(value);
      lastInvokeTime.current = Date.now();
      leadingExecuted.current = false;
    };
  }, [value, cleanup]);

  return {
    debouncedValue,
    reset,
    flush,
    isPending: debouncedValue !== value,
  };
}

/**
 * Hook simplificado para casos de uso básicos
 */
export function useSimpleDebounce<T>(value: T, delay: number = 300): T {
  const { debouncedValue } = useDebounce(value, delay);
  return debouncedValue;
}

/**
 * Hook para debounce de funciones de callback
 */
export function useDebounceCallback<TArgs extends any[]>(
  callback: (...args: TArgs) => void,
  delay: number = 300,
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    return (...args: TArgs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    };
  }, [delay]);

  const cancel = useMemo(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const flush = useMemo(() => {
    return (...args: TArgs) => {
      cancel();
      callbackRef.current(...args);
    };
  }, [cancel]);

  // Cleanup al desmontar
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    debouncedCallback,
    cancel,
    flush,
  };
}
