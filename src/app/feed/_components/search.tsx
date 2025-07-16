"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_FILTERS } from "@/lib/consts";
import {
  FilterChangeEvent,
  FilterState,
  RecentSearch,
  SearchSuggestion,
  UploadWithDetails,
} from "@/lib/types";

import RecentSearchChip from "./recent-search-chip";
import ResultCard from "./result-card";
import SuggestionCard from "./suggestion-card";
import { useAllUploads } from "../_hooks/use-all-uploads";

interface SearchProps {
  suggestions: SearchSuggestion[];
  onFilterChange: (event: FilterChangeEvent) => void;
  children?: React.ReactNode;
}

const Search = ({ suggestions, onFilterChange, children }: SearchProps) => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
  });

  const { uploads } = useAllUploads();

  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [filteredResults, setFilteredResults] = useState<UploadWithDetails[]>(
    [],
  );
  const [isSearchConfirmed, setIsSearchConfirmed] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hudlab-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
    };

    setRecentSearches((prev) => {
      const updated = [
        newSearch,
        ...prev.filter((s) => s.query !== query.trim()),
      ].slice(0, 5);
      localStorage.setItem("hudlab-recent-searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      updateFilter("searchText", query);
      setShowSuggestions(query === "");
    },
    [updateFilter],
  );

  const handleConfirmSearch = useCallback(() => {
    router.push("/feed");
    onFilterChange({ filters });
    setShowSuggestions(true);
    setOpen(false);
  }, [filters, onFilterChange, router]);

  const handleSelect = (query: string) => {
    updateFilter("searchText", query);
    setIsSearchConfirmed(true);
    handleConfirmSearch();
  };

  useEffect(() => {
    if (isSearchConfirmed) {
      handleConfirmSearch();
      addToRecentSearches(filters.searchText);
    }
    return () => setIsSearchConfirmed(false);
  }, [
    isSearchConfirmed,
    handleConfirmSearch,
    addToRecentSearches,
    filters.searchText,
  ]);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.query !== query);
      localStorage.setItem("hudlab-recent-searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleInputFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const filterUploads = useCallback(() => {
    const searchText = filters.searchText.trim().toLowerCase();

    if (!searchText) return setFilteredResults([]);

    const filtered = uploads.filter((upload) => {
      const match = (value?: string | null) =>
        value?.toLowerCase().includes(searchText);

      return (
        match(upload.title) ||
        match(upload.description) ||
        match(upload.tags) ||
        match(upload.game.name) ||
        match(upload.game.platforms)
      );
    });

    setFilteredResults(filtered);
  }, [uploads, filters.searchText]);

  useEffect(() => {
    if (filters.searchText) {
      filterUploads();
    } else {
      setFilteredResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchText]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 text-6xl">🎮</div>
      <h3 className="mb-2 text-xl font-semibold">No hay resultados</h3>
      <p className="text-muted-foreground max-w-md text-center">
        No hemos encontrado HUDs que coincidan con tu búsqueda. Intenta ajustar
        los filtros o buscar por otro término.
      </p>
    </div>
  );

  return (
    <>
      <div className="flex w-full items-center gap-2">
        <label className="input input-neutral input-ghost bg-base-200 focus-within:bg-base-300! relative h-12 w-full">
          <IconSearch className="text-base-content/60 size-6 opacity-50" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.searchText}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Buscar HUDs..."
            className="text-base"
          />
        </label>
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          isBlurred
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
          overlayClassName="bg-base-100/80"
          className="data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 max-h-full! min-h-dvh max-w-full! overflow-y-auto border-0 bg-transparent p-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Buscar HUDs</DialogTitle>
            <DialogDescription>
              Busca HUDs por nombre, plataforma, año de lanzamiento y más.
            </DialogDescription>
          </DialogHeader>
          <div
            className="mx-auto w-full px-4 py-4 md:px-20"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setOpen(false);
              }
            }}
          >
            <div className="sticky top-0 z-10 mb-8">
              <label className="input input-neutral input-ghost bg-base-200 focus-within:bg-base-300! relative h-12 w-full">
                <IconSearch className="text-base-content/60 size-6 opacity-50" />
                <input
                  ref={dialogInputRef}
                  type="text"
                  placeholder="Buscar HUDs..."
                  autoFocus
                  value={filters.searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmSearch();
                    }
                  }}
                  className="border-border text-base"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    updateFilter("searchText", "");
                    setOpen(false);
                  }}
                >
                  <IconX />
                </Button>
              </label>
            </div>

            {/* Búsquedas recientes */}
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold">
                  Búsquedas recientes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search) => (
                    <RecentSearchChip
                      key={search.id}
                      query={search.query}
                      onSelect={handleSelect}
                      onRemove={removeRecentSearch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mostrar resultados de búsqueda cuando se haya escrito */}
            {filters.searchText && (
              <>
                {filteredResults.length > 0 ? (
                  <div className="grid gap-2">
                    {filteredResults.slice(0, 12).map((upload) => (
                      <ResultCard
                        key={upload.id}
                        upload={upload}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                ) : (
                  emptyState
                )}
              </>
            )}

            {/* Mostrar sugerencias cuando no hay texto de búsqueda */}
            {!filters.searchText && showSuggestions && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Sugerencias</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {suggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onSelect={() => {
                        router.push(`/feed/${suggestion.publicId}`);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Search;
