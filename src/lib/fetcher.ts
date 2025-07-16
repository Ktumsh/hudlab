import type { ApplicationError } from "./types";

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
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
