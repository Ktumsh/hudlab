"use client";

import { IconSearch, IconTrendingUp, IconRefresh } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onClearFilters: () => void;
  onShowPopular: () => void;
}

const EmptyState = ({ onClearFilters, onShowPopular }: EmptyStateProps) => {
  return (
    <div className="animate-in fade-in-0 mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
      <div className="bg-base-300 mb-6 rounded-full p-4">
        <IconSearch className="text-content-muted size-8" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No hay HUDs disponibles</h3>
      <p className="text-content-muted mb-6 leading-relaxed">
        No encontramos HUDs que coincidan con tus filtros actuales. Intenta
        ajustar los filtros o buscar por otro término.
      </p>

      <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
        <Button size="sm" onClick={onClearFilters}>
          <IconRefresh />
          Limpiar filtros
        </Button>
        <Button variant="primary" size="sm" onClick={onShowPopular}>
          <IconTrendingUp />
          Ver populares
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
