"use client";

import { IconSearch, IconMoodSad } from "@tabler/icons-react";

interface SearchEmptyStateProps {
  query?: string;
}

const SearchEmptyState = ({ query }: SearchEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-6">
        {/* Ícono principal de búsqueda */}
        <div className="bg-neutral rounded-full p-6">
          <IconSearch className="size-12" />
        </div>

        {/* Ícono secundario superpuesto para indicar "no encontrado" */}
        <div className="bg-base-300 border-base-100 absolute -right-1 -bottom-1 rounded-full border-2 p-1.5">
          <IconMoodSad className="text-content-muted size-5" />
        </div>
      </div>

      <h3 className="text-base-content mb-2 text-xl font-semibold">
        No hay resultados{" "}
        {query && (
          <>
            para <span className="font-medium">&ldquo;{query}&rdquo;</span>
          </>
        )}
      </h3>

      <p className="text-base-content/80 max-w-md text-center text-sm">
        No hemos encontrado HUDs que coincidan con tu búsqueda. Intenta ajustar
        los filtros o buscar por otro término.
      </p>

      <div className="text-content-muted mt-4 text-xs">
        💡 Consejo: Prueba con palabras clave más generales
      </div>
    </div>
  );
};

export default SearchEmptyState;
