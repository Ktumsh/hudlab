"use client";

import useSWRMutation from "swr/mutation";

import { apiPost } from "@/lib/fetcher";

/**
 * Hook genérico para mutaciones POST con update optimista y rollback.
 * No asume forma específica de cache: recibe un callback mutate externo opcional (SWR mutate u otro).
 */
export interface UseOptimisticSWRMutationOptions<TCache, TResponse> {
  /** Construye el estado optimista a partir del anterior */
  buildOptimistic?: (prev: TCache | undefined) => TCache | undefined;
  /** Reconcilia estado final con respuesta servidor */
  reconcile?: (
    server: TResponse,
    current: TCache | undefined,
    rollback?: TCache,
  ) => TCache | undefined;
  /** Mutate externo (ej: de useSWR) para aplicar cambios a la cache principal */
  externalMutate?: (
    updater: (prev: TCache | undefined) => TCache | undefined,
    opts?: { revalidate?: boolean },
  ) => Promise<unknown> | unknown;
  /** Payload dinámico para la petición (si aplica) */
  getBody?: () => unknown;
  /** Manejo de error custom */
  onError?: (error: Error) => void;
  /** Manejo de éxito adicional */
  onSuccess?: (response: TResponse) => void | Promise<void>;
}

export function useOptimisticSWRMutation<TResponse = unknown, TCache = unknown>(
  endpoint: string,
  options: UseOptimisticSWRMutationOptions<TCache, TResponse> = {},
) {
  async function fetcher(url: string): Promise<TResponse> {
    return apiPost<TResponse>(url, {
      body: options.getBody ? options.getBody() : undefined,
    });
  }

  const { trigger, isMutating } = useSWRMutation(endpoint, () =>
    fetcher(endpoint),
  );

  const run = async (): Promise<TResponse> => {
    let rollback: TCache | undefined;

    if (options.externalMutate && options.buildOptimistic) {
      await options.externalMutate(
        (prev) => {
          rollback = prev;
          return options.buildOptimistic!(prev);
        },
        { revalidate: false },
      );
    }

    try {
      const response = await trigger();

      if (options.externalMutate && options.reconcile) {
        await options.externalMutate(
          (current) => options.reconcile!(response, current, rollback),
          { revalidate: false },
        );
      }

      await options.onSuccess?.(response);
      return response;
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Error desconocido");
      if (options.externalMutate && rollback) {
        await options.externalMutate(() => rollback, { revalidate: false });
      }
      options.onError?.(err);
      throw err;
    }
  };

  return { run, isMutating };
}

export default useOptimisticSWRMutation;
