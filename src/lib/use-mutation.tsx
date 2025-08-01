"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { apiUrl } from "./consts";

interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables,
  ) => void | Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  data: TData | undefined;
  reset: () => void;
}

export function useMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TVariables>,
): MutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(undefined);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await mutationFn(variables);
        setData(result);

        if (options?.successMessage) {
          toast.success(options.successMessage);
        }

        await options?.onSuccess?.(result, variables);
        await options?.onSettled?.(result, null, variables);

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Error desconocido");
        setError(error);

        if (options?.errorMessage) {
          toast.error(options.errorMessage);
        } else {
          toast.error(error.message);
        }

        await options?.onError?.(error, variables);
        await options?.onSettled?.(undefined, error, variables);

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options],
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // Error ya manejado en mutateAsync
      });
      return mutateAsync(variables);
    },
    [mutateAsync],
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
    data,
    reset,
  };
}

// Hook específico para peticiones API que sigue el patrón REST
export function useApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: MutationOptions<TData, TVariables>,
) {
  const mutationFn = useCallback(
    async (variables: TVariables): Promise<TData> => {
      let url = `${apiUrl}${endpoint}`;
      let body: string | undefined;

      if (method === "DELETE" && variables) {
        // Para DELETE, agregar parámetros como query string
        const params = new URLSearchParams();
        Object.entries(variables as Record<string, unknown>).forEach(
          ([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value));
            }
          },
        );
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      } else if (method !== "DELETE" && variables) {
        body = JSON.stringify(variables);
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔧 FIX: Agregar cookies de autenticación
        body,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error de red" }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      return response.json();
    },
    [endpoint, method],
  );

  return useMutation(mutationFn, options);
}

export default useMutation;
