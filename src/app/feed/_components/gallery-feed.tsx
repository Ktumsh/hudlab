"use client";

import dynamic from "next/dynamic";

import { useFilters } from "@/hooks/use-filters";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import EmptyState from "./empty-state";
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
    const baseFilters = {
      searchText: "",
      tags: [],
      platform: undefined,
      releaseYear: undefined,
      inMyCollections: false,
    };

    return (
      <EmptyState
        onClearFilters={() => setFilters({ ...baseFilters, sortBy: "newest" })}
        onShowPopular={() => setFilters({ ...baseFilters, sortBy: "popular" })}
      />
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
