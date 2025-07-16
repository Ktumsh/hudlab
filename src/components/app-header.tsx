"use client";

import { IconChevronLeft, IconUser } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/hooks/use-filters";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib";
import { SearchSuggestion, FilterOptions } from "@/lib/types";

import Filters from "./filters";
import { BetterTooltip } from "./ui/tooltip";
import Search from "../app/feed/_components/search";

interface AppHeaderProps {
  filterOptionsPromise: Promise<FilterOptions>;
  suggestionsPromise: Promise<SearchSuggestion[]>;
}

const PAGES_TO_HIDE = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

const AppHeader = ({
  filterOptionsPromise,
  suggestionsPromise,
}: AppHeaderProps) => {
  const filterOptions = use(filterOptionsPromise);
  const suggestions = use(suggestionsPromise);

  const { setFilters, onFilterChange } = useFilters();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/feed";

  const isMobile = useIsMobile();

  if (PAGES_TO_HIDE.includes(pathname)) return null;

  const logo = (
    <BetterTooltip content="Inicio" side="bottom">
      <Link
        href="/feed"
        onClick={(e) => {
          e.preventDefault();
          setFilters({
            searchText: "",
            tags: [],
            platform: undefined,
            releaseYear: undefined,
            isFavorited: false,
            sortBy: "newest",
          });
          router.push("/feed");
        }}
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
      >
        <Image
          priority
          src="/logo/HUDLab-logo.webp"
          alt="HUDLab Logo"
          width={36}
          height={36}
          className="rounded-full"
        />
      </Link>
    </BetterTooltip>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "bg-base-100/80 sticky top-0 z-50 w-full backdrop-blur",
          !isHome && "fixed bg-transparent backdrop-blur-none",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center justify-between px-4",
            !isHome && "items-end px-2",
          )}
        >
          {isHome ? (
            logo
          ) : (
            <Button
              size="icon-lg"
              onClick={() => router.back()}
              className="text-base-300 border-0 bg-white/80"
            >
              <IconChevronLeft className="-ms-0.5 size-7" />
              <span className="sr-only">Volver</span>
            </Button>
          )}
          {isHome && (
            <Filters
              filterOptions={filterOptions}
              onFilterChange={onFilterChange}
            />
          )}
        </div>
      </header>
    );
  }
  return (
    <header className="bg-base-100/80 sticky top-0 z-50 w-full backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        {logo}
        <div className="mx-auto w-full">
          <Search suggestions={suggestions} onFilterChange={onFilterChange}>
            {isHome && (
              <Filters
                filterOptions={filterOptions}
                onFilterChange={onFilterChange}
              />
            )}
          </Search>
        </div>
        <Button variant="ghost" size="icon">
          <Avatar className="size-9">
            <AvatarImage />
            <AvatarFallback>
              <IconUser className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
