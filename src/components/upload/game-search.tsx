"use client";

import { IconChevronDown, IconDeviceGamepad2 } from "@tabler/icons-react";
import Image from "next/image";
import { useState, useCallback } from "react";

import Loader from "../loader";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimpleSearchDebounce } from "@/hooks/use-debounce";
import { useGames, usePopularGames } from "@/hooks/use-games";
import { Game } from "@/lib/types";

interface GameSearchProps {
  onGameSelect: (game: Game) => void;
  selectedGame?: Game | null;
  maxResults?: number;
}

export default function GameSearch({
  onGameSelect,
  selectedGame,
  maxResults = 10,
}: GameSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const {
    games: popularGames,
    isLoading: isLoadingPopular,
    error: popularError,
  } = usePopularGames(maxResults);

  const debouncedSearchQuery = useSimpleSearchDebounce(searchQuery, 300);

  const {
    games: searchResults,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useGames({
    search: debouncedSearchQuery.trim() || undefined,
    limit: maxResults,
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
    },
    [setSearchQuery],
  );

  const handleGameSelect = useCallback(
    (game: Game) => {
      onGameSelect(game);
      setOpen(false);
    },
    [onGameSelect],
  );

  // Determinar qué juegos mostrar
  const gamesToShow = searchQuery.trim() ? searchResults : popularGames;
  const isLoading = searchQuery.trim() ? isLoadingSearch : isLoadingPopular;
  const hasError = searchQuery.trim() ? searchError : popularError;

  const placeholder = "Buscar juego...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          outline
          className="text-content-muted hover:bg-base-100 input cursor-pointer justify-start gap-3 font-normal"
        >
          <IconDeviceGamepad2 />
          {selectedGame ? selectedGame.name : placeholder}
          <IconChevronDown className="ms-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[303px] p-0"
        side="top"
        align="start"
        disablePortal
      >
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <Loader className="size-4" />
              ) : hasError ? (
                "Error al cargar juegos."
              ) : (
                "No se encontraron juegos."
              )}
            </CommandEmpty>
            <CommandGroup
              heading={searchQuery ? "Resultados" : "Juegos populares"}
            >
              <ScrollArea className="z-1000 h-60">
                {gamesToShow.map((game: Game) => (
                  <CommandItem
                    key={game.id}
                    value={game.name}
                    onSelect={() => handleGameSelect(game)}
                    className="flex flex-col items-start space-y-1"
                  >
                    <div className="flex w-full items-center gap-2">
                      <Image
                        src={game.coverUrl ?? ""}
                        alt={game.name}
                        width={64}
                        height={64}
                        className="rounded-field size-12 object-cover"
                      />
                      <span className="font-medium">{game.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
