"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";

import type { FilterChangeEvent, FilterState } from "@/lib/types";

const FilterContext = createContext<
  | {
      filters: FilterState;
      setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
      onFilterChange: (e: FilterChangeEvent) => void;
      hasActiveFilters: boolean;
    }
  | undefined
>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>({
    searchText: "",
    tags: [],
    platform: undefined,
    releaseYear: undefined,
    inMyCollections: false,
    sortBy: "newest",
  });

  const handleFilterChange = (e: FilterChangeEvent) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, ...e.filters };

      for (const key in updatedFilters) {
        if (updatedFilters[key as keyof typeof updatedFilters] === "none") {
          updatedFilters[key as "platform" | "releaseYear"] = undefined;
        }
      }

      return updatedFilters;
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchText.trim() !== "" ||
      filters.tags.length > 0 ||
      filters.platform !== undefined ||
      filters.releaseYear !== undefined ||
      filters.inMyCollections === true
    );
  }, [filters]);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        onFilterChange: handleFilterChange,
        hasActiveFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};
