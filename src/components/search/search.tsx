"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

import RecentSearchChip from "./recent-search-chip";
import ResultCard from "./result-card";
import SearchEmptyState from "./search-empty-state";
import SuggestionCard from "./suggestion-card";
import UploadSearchSkeleton from "./upload-search-skeleton";
import UserResultCard from "./user-result-card";
import UserSearchSkeleton from "./user-search-skeleton";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useFilters } from "@/hooks/use-filters";
import { useIsMac } from "@/hooks/use-is-mac";
import { useSearchShortcuts } from "@/hooks/use-search-shortcuts";
import { useUploadSearch } from "@/hooks/use-upload-search";
import { useUserSearch } from "@/hooks/use-user-search";
import { FilterChangeEvent, RecentSearch, SearchSuggestion } from "@/lib/types";


interface SearchProps {
  suggestions: SearchSuggestion[];
  onFilterChange: (event: FilterChangeEvent) => void;
  children?: React.ReactNode;
}

const Search = ({ suggestions, onFilterChange, children }: SearchProps) => {
  const router = useRouter();
  const { filters, setFilters } = useFilters();

  // 🔄 Estado local para la búsqueda (no afecta filtros globales hasta confirmar)
  const [localQuery, setLocalQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isSearchConfirmed, setIsSearchConfirmed] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Referencias
  const dialogInputRef = useRef<HTMLInputElement>(null);

  // 🖥️ Hook para detectar Mac
  const isMac = useIsMac();

  // ⏱️ Debounce optimizado para búsquedas
  const { debouncedValue: debouncedSearchText, flush: flushDebounce } =
    useDebounce(localQuery, 300); // 300ms balanceado entre UX y performance

  // Estado para mostrar indicador de debouncing
  const isPending = localQuery !== debouncedSearchText;

  // 🔍 Hooks de búsqueda ultra-optimizados
  const { users: searchedUsers, isLoading: userLoading } =
    useUserSearch(debouncedSearchText);
  const { uploads: uploadResults, isLoading: uploadLoading } =
    useUploadSearch(debouncedSearchText);

  // 🎨 Función para mostrar valor visual (con # si viene de tag)
  const getDisplayValue = () => {
    // Si hay tags activos y coinciden con el searchText del contexto, mostrar con #
    if (filters.tags.length > 0 && filters.searchText === filters.tags[0]) {
      return `#${filters.searchText}`;
    }
    // Si estamos escribiendo manualmente, usar el estado local
    if (localQuery !== filters.searchText) {
      return localQuery;
    }
    return filters.searchText;
  };

  // 🔄 Sincronizar estado local cuando cambien los filtros externos (como clicks en tags)
  useEffect(() => {
    setLocalQuery(filters.searchText);
  }, [filters.searchText]);

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

  // Control de visibilidad de sugerencias
  useEffect(() => {
    setShowSuggestions(!debouncedSearchText.trim());
  }, [debouncedSearchText]);

  // 🔑 Shortcuts de teclado para búsqueda
  useSearchShortcuts({
    isOpen: open,
    onToggle: () => setOpen(true),
    onClose: () => setOpen(false),
    onFocus: () => dialogInputRef.current?.focus(),
  });

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

  const handleSearch = useCallback((query: string) => {
    // ⚡ Actualización inmediata del estado local para UI responsiva
    setLocalQuery(query);
  }, []);

  const handleConfirmSearch = useCallback(() => {
    // 🚀 Flush del debounce para aplicar inmediatamente si hay cambios pendientes
    flushDebounce();

    // AQUÍ es donde aplicamos la búsqueda a los filtros globales
    setFilters((prev) => ({
      ...prev,
      searchText: localQuery,
      tags: [], // Limpiar tags al confirmar búsqueda manual
    }));

    router.push("/feed");
    onFilterChange({
      filters: { ...filters, searchText: localQuery, tags: [] },
    });
    setShowSuggestions(true);
    setOpen(false);

    // Agregar a búsquedas recientes
    addToRecentSearches(localQuery);
  }, [
    localQuery,
    filters,
    setFilters,
    router,
    onFilterChange,
    addToRecentSearches,
    flushDebounce,
  ]);

  const handleRecentSearchSelect = (query: string) => {
    // Para búsquedas recientes, limpiar tags para evitar conflictos
    setFilters((prev) => ({
      ...prev,
      searchText: query,
      tags: [],
    }));
    setIsSearchConfirmed(true);
    addToRecentSearches(query);
  };

  const handleResultSelect = (query: string) => {
    // Para result cards, también limpiar tags para evitar conflictos
    setFilters((prev) => ({
      ...prev,
      searchText: query,
      tags: [],
    }));
    setIsSearchConfirmed(true);
    addToRecentSearches(query);
  };

  const handleUserSelect = (username: string) => {
    // Navegar directamente al perfil del usuario
    router.push(`/${username}`);
    setOpen(false);
  };

  useEffect(() => {
    if (isSearchConfirmed) {
      // Esperar a que los filtros se actualicen antes de confirmar
      const timer = setTimeout(() => {
        router.push("/feed");
        onFilterChange({ filters });
        setOpen(false);
        setIsSearchConfirmed(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isSearchConfirmed, filters, router, onFilterChange]);

  const removeRecentSearch = (id: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((search) => search.id !== id);
      localStorage.setItem("hudlab-recent-searches", JSON.stringify(updated));
      return updated;
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirmSearch();
    }
  };

  return (
    <>
      <div className="flex w-full items-center gap-2">
        <label className="input input-neutral input-ghost bg-base-200 focus-within:bg-base-300! relative h-12 w-full">
          <IconSearch className="text-base-content/60 size-6 opacity-50" />
          <input
            type="text"
            value={getDisplayValue()}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setOpen(true);
              setIsInputFocused(true);
            }}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Buscar HUDs..."
            className="text-base"
          />
          {/* 🔑 Shortcut visual indicator - solo mostrar cuando no hay texto y no está enfocado */}
          {!getDisplayValue() && !isInputFocused && (
            <div className="text-base-content/40 absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 text-xs font-medium sm:flex">
              <kbd className="bg-base-300 text-base-content/60 rounded border px-1.5 py-0.5 font-mono text-xs">
                {isMac ? "⌘" : "Ctrl"}
              </kbd>
              <kbd className="bg-base-300 text-base-content/60 rounded border px-1.5 py-0.5 font-mono text-xs">
                K
              </kbd>
            </div>
          )}
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
                <IconSearch
                  className={`text-base-content/60 size-6 opacity-50 ${isPending ? "text-primary animate-pulse" : ""}`}
                />
                <input
                  ref={dialogInputRef}
                  type="text"
                  placeholder="Buscar HUDs..."
                  autoFocus
                  value={getDisplayValue()}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="border-border text-base"
                />
                {isPending && (
                  <div className="absolute top-1/2 right-12 -translate-y-1/2">
                    <div className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Limpiar estado local y cerrar modal
                    setLocalQuery("");
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
                      onSelect={handleRecentSearchSelect}
                      onRemove={removeRecentSearch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mostrar resultados de búsqueda cuando se haya escrito */}
            {localQuery && (
              <>
                {/* Skeletons mientras carga */}
                {(userLoading || uploadLoading) && (
                  <div className="space-y-6">
                    {userLoading && <UserSearchSkeleton />}
                    {uploadLoading && <UploadSearchSkeleton />}
                  </div>
                )}

                {/* Resultados reales cuando no está loading */}
                {!userLoading &&
                  !uploadLoading &&
                  (searchedUsers.length > 0 || uploadResults.length > 0) && (
                    <div className="space-y-6">
                      {/* Resultados de usuarios */}
                      {searchedUsers.length > 0 && (
                        <div>
                          <h4 className="text-base-content/70 mb-3 text-sm font-semibold">
                            Usuarios
                          </h4>
                          <div className="grid gap-1">
                            {searchedUsers.map((user) => (
                              <UserResultCard
                                key={user.id}
                                user={user}
                                onSelect={handleUserSelect}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resultados de HUDs */}
                      {uploadResults.length > 0 && (
                        <div>
                          <h4 className="text-base-content/70 mb-3 text-sm font-semibold">
                            HUDs
                          </h4>
                          <div className="grid gap-2">
                            {uploadResults.slice(0, 12).map((upload) => (
                              <ResultCard
                                key={upload.id}
                                upload={upload}
                                onSelect={handleResultSelect}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Estado vacío */}
                {!userLoading &&
                  !uploadLoading &&
                  debouncedSearchText &&
                  searchedUsers.length === 0 &&
                  uploadResults.length === 0 && (
                    <SearchEmptyState query={debouncedSearchText} />
                  )}
              </>
            )}

            {/* Mostrar sugerencias cuando no hay texto de búsqueda */}
            {!localQuery && showSuggestions && (
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
