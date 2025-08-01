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
