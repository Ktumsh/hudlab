"use client";

import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { DEFAULT_FILTERS } from "@/lib/consts";

import FilterItem from "./filter-item";

import type {
  FilterChangeEvent,
  FilterOptions,
  FilterState,
} from "@/lib/types";

interface FiltersProps {
  filterOptions: FilterOptions;
  onFilterChange: (event: FilterChangeEvent) => void;
}

const Filters = ({ filterOptions, onFilterChange }: FiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
  });

  const isMobile = useIsMobile();

  const hasActiveFilters =
    filters.searchText !== "" ||
    filters.tags.length > 0 ||
    filters.platform !== "none" ||
    filters.releaseYear !== "none" ||
    filters.isFavorited ||
    filters.sortBy !== "newest";

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    onFilterChange({ filters });
  }, [filters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const sortOptions = [
    { value: "newest", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
    { value: "popular", label: "Más populares" },
  ];

  const platformOptions = filterOptions.platforms.map((platform) => ({
    value: platform,
    label: platform,
  }));

  const yearOptions = filterOptions.releaseYears.map((year) => ({
    value: year,
    label: year.toString(),
  }));

  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button outline size={isMobile ? "icon-lg" : "lg"}>
          <IconAdjustmentsHorizontal className="size-5!" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4" align="end" sideOffset={10}>
        <div className="flex flex-col gap-2">
          <h3 className="mb-2 font-semibold">Filtrar HUDs por</h3>
          <FilterItem
            label="Orden"
            value={filters.sortBy}
            options={sortOptions}
            onChange={(value) => {
              updateFilter(
                "sortBy",
                value === "none"
                  ? "newest"
                  : (value as "newest" | "oldest" | "popular"),
              );
            }}
            placeholder="Más recientes"
          />
          <FilterItem
            label="Plataforma"
            value={filters.platform}
            options={[{ value: "none", label: "Todas" }, ...platformOptions]}
            onChange={(value) => updateFilter("platform", value)}
            placeholder="Todas"
          />
          <FilterItem
            label="Año"
            value={String(filters.releaseYear)}
            options={[{ value: "none", label: "Todos" }, ...yearOptions]}
            onChange={(value) => updateFilter("releaseYear", value)}
            placeholder="Todos"
          />
          <div className="mt-4 space-y-2">
            {hasActiveFilters && (
              <Button size="sm" outline wide onClick={clearAllFilters}>
                Restablecer
              </Button>
            )}
            <Button size="sm" wide onClick={handleApplyFilters}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Filters;
