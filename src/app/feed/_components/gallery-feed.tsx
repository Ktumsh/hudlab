"use client";

import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { useFilters } from "@/hooks/use-filters";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import FooterStatus from "./footer-status";
import { usePaginatedUploads } from "../_hooks/use-paginated-uploads";

const MasonryGrid = dynamic(() => import("./masonry-grid"), {
  ssr: false,
});

const GalleryFeed = () => {
  const { filters, setFilters } = useFilters();

  const { uploads, loadMore, isLoadingInitial, isLoadingMore, isReachingEnd } =
    usePaginatedUploads(filters);

  useInfiniteScroll({
    disabled: isLoadingInitial || isLoadingMore || isReachingEnd,
    onLoadMore: loadMore,
  });

  if (uploads.length === 0 && !isLoadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 text-6xl">🎮</div>
        <h3 className="mb-2 text-xl font-semibold">No hay HUDs disponibles</h3>
        <p className="text-muted-foreground max-w-md text-center">
          No hemos encontrado HUDs que coincidan con tu búsqueda. Intenta
          ajustar los filtros o buscar por otro término.
        </p>
        <Button
          outline
          onClick={() => {
            setFilters({
              searchText: "",
              tags: [],
              platform: undefined,
              releaseYear: undefined,
              isFavorited: false,
              sortBy: "newest",
            });
          }}
        >
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative px-1 pt-1 md:px-6">
        <MasonryGrid
          key={`${filters.searchText}-${filters.sortBy}-${filters.platform}-${filters.releaseYear}`}
          uploads={uploads}
          loading={isLoadingMore}
          initialLoading={isLoadingInitial}
          isReachingEnd={isReachingEnd}
        />
      </div>
      <FooterStatus
        isLoadingInitial={isLoadingInitial}
        isLoadingMore={isLoadingMore}
        isReachingEnd={isReachingEnd}
        hasUploads={uploads.length > 0}
      />
    </>
  );
};

export default GalleryFeed;
