"use client";

import { useRef, useCallback } from "react";

interface RequestProtectionConfig {
  debounceMs?: number; // Tiempo de debounce para evitar múltiples llamadas
  throttleMs?: number; // Tiempo mínimo entre peticiones
  maxRetries?: number; // Máximo número de reintentos
}

interface RequestProtectionReturn<T extends unknown[], R> {
  executeRequest: (...args: T) => Promise<R>;
  isThrottled: boolean;
  hasRecentRequest: boolean;
}

/**
 * Hook para proteger peticiones HTTP contra abuso sin afectar el estado optimista
 *
 * IMPORTANTE: Este hook SOLO controla las peticiones HTTP, NO el estado optimista.
 * El estado optimista debe actualizarse inmediatamente independientemente de las protecciones.
 */
export const useRequestProtection = <T extends unknown[], R>(
  requestFunction: (...args: T) => Promise<R>,
  config: RequestProtectionConfig = {},
): RequestProtectionReturn<T, R> => {
  const { debounceMs = 300, throttleMs = 1000, maxRetries = 3 } = config;

  // Referencias para tracking de tiempo
  const lastRequestTime = useRef<number>(0);
  const pendingRequest = useRef<NodeJS.Timeout | null>(null);
  const isThrottledRef = useRef<boolean>(false);
  const requestQueue = useRef<Map<string, Promise<R>>>(new Map());

  const executeRequest = useCallback(
    async (...args: T): Promise<R> => {
      const now = Date.now();
      const requestKey = JSON.stringify(args);

      // Si ya hay una petición idéntica en curso, retornar la misma promesa
      if (requestQueue.current.has(requestKey)) {
        return requestQueue.current.get(requestKey)!;
      }

      // Verificar throttling
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < throttleMs) {
        console.warn(
          `Request throttled. Wait ${throttleMs - timeSinceLastRequest}ms before next request.`,
        );

        // Marcar como throttled temporalmente
        isThrottledRef.current = true;
        setTimeout(() => {
          isThrottledRef.current = false;
        }, throttleMs - timeSinceLastRequest);

        // Retornar una promesa que se resuelva después del throttle
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await executeRequest(...args);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, throttleMs - timeSinceLastRequest);
        });
      }

      // Limpiar timeout pendiente de debounce
      if (pendingRequest.current) {
        clearTimeout(pendingRequest.current);
      }

      // Crear nueva promesa de petición
      const requestPromise = new Promise<R>((resolve, reject) => {
        // Debounce: esperar antes de ejecutar
        pendingRequest.current = setTimeout(async () => {
          let retries = 0;

          const attemptRequest = async (): Promise<R> => {
            try {
              lastRequestTime.current = Date.now();

              // Ejecutar la petición original
              const result = await requestFunction(...args);

              // Limpiar de la cola una vez completada
              requestQueue.current.delete(requestKey);

              return result;
            } catch (error) {
              if (retries < maxRetries) {
                retries++;
                console.warn(
                  `Request failed, retry ${retries}/${maxRetries}:`,
                  error,
                );

                // Espera exponencial: 1s, 2s, 4s...
                await new Promise((resolve) =>
                  setTimeout(resolve, Math.pow(2, retries - 1) * 1000),
                );

                return attemptRequest();
              } else {
                // Limpiar de la cola si falló definitivamente
                requestQueue.current.delete(requestKey);
                throw error;
              }
            }
          };

          try {
            const result = await attemptRequest();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, debounceMs);
      });

      // Añadir a la cola de peticiones
      requestQueue.current.set(requestKey, requestPromise);

      return requestPromise;
    },
    [requestFunction, debounceMs, throttleMs, maxRetries],
  );

  return {
    executeRequest,
    isThrottled: isThrottledRef.current,
    hasRecentRequest: Date.now() - lastRequestTime.current < throttleMs,
  };
};
