"use client";

import { IconChevronLeft, IconIcons, IconSettings2 } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Filters from "./filters";
import Search from "./search/search";
import { BetterTooltip } from "./ui/tooltip";
import UserOptions from "./user-options";

import { Button } from "@/components/ui/button";
import { useFilterOptions } from "@/hooks/use-filter-options";
import { useFilters } from "@/hooks/use-filters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchSuggestions } from "@/hooks/use-search-suggestions";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib";

const PAGES_TO_HIDE = ["/auth", "/legal"];

const AppHeader = () => {
  const { filterOptions } = useFilterOptions();
  const { searchSuggestions } = useSearchSuggestions();

  const { setFilters, onFilterChange, hasActiveFilters } = useFilters();
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/feed";
  const isSelfProfile = pathname.startsWith("/me");
  const isUpload = pathname.startsWith("/feed/");
  const isCollection = /^\/[^/]+\/collections\/[^/]+/.test(pathname);

  const { user } = useUser();

  const isMobile = useIsMobile();

  if (PAGES_TO_HIDE.some((page) => pathname.startsWith(page))) return null;

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
            inMyCollections: false,
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
          "bg-base-100/80 sticky top-0 z-50 w-full backdrop-blur-md",
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
            <>
              <Button
                size="icon-lg"
                onClick={() =>
                  isUpload || isCollection
                    ? router.back()
                    : router.push("/feed")
                }
                className="text-base-content bg-base-100/80 mb-1 border-0"
              >
                <IconChevronLeft className="-ms-0.5 size-7" />
                <span className="sr-only">Volver</span>
              </Button>
              {isSelfProfile && (
                <Button size="icon-lg" variant="ghost">
                  <IconSettings2 className="size-6" />
                </Button>
              )}
            </>
          )}
          {isHome && (
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Filters
                  filterOptions={filterOptions}
                  onFilterChange={onFilterChange}
                />
              )}
              {user ? (
                <Button size="icon-md">
                  <IconIcons className="size-5" />
                </Button>
              ) : (
                <>
                  <Button size="sm" asChild className="h-9">
                    <Link href="/auth/login">Iniciar sesión</Link>
                  </Button>
                  <Button variant="primary" size="sm" asChild className="h-9">
                    <Link href="/auth/signup">Registrarse</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }
  return (
    <header className="bg-base-100/80 sticky top-0 z-50 w-full backdrop-blur-md">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        {logo}
        <div className="mx-auto w-full">
          <Search
            suggestions={searchSuggestions}
            onFilterChange={onFilterChange}
          >
            {isHome && hasActiveFilters && (
              <Filters
                filterOptions={filterOptions}
                onFilterChange={onFilterChange}
              />
            )}
          </Search>
        </div>
        <UserOptions />
      </div>
    </header>
  );
};

export default AppHeader;
