import { apiUrl } from "./consts";

import type { ApplicationError } from "./types";

interface FetcherOptions {
  noStore?: boolean;
}

export async function fetcher<T>(
  url: string,
  options?: FetcherOptions,
): Promise<T> {
  const fetchUrl = url.startsWith("/api/") ? `${apiUrl}${url}` : url;

  const res = await fetch(fetchUrl, {
    credentials: "include",
    cache: options?.noStore ? "no-store" : "default",
  });

  if (!res.ok) {
    const error = new Error(
      "Ocurrió un error al hacer fetch de los datos",
    ) as ApplicationError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
}

interface ApiPostOptions<TBody> {
  body?: TBody;
  noStore?: boolean; // para simetría, aunque POST usualmente no cachea
  signal?: AbortSignal;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
}

export async function apiPost<TResponse, TBody = unknown>(
  url: string,
  { body, noStore, signal, method = "POST" }: ApiPostOptions<TBody> = {},
): Promise<TResponse> {
  const fetchUrl = url.startsWith("/api/") ? `${apiUrl}${url}` : url;
  const res = await fetch(fetchUrl, {
    method,
    credentials: "include",
    cache: noStore ? "no-store" : "no-cache",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!res.ok) {
    const error = new Error(
      "Ocurrió un error al procesar la solicitud",
    ) as ApplicationError;
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  return (await res.json()) as TResponse;
}
