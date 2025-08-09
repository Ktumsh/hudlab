"use client";

import { Masonry } from "masonic";

import UploadCard from "./upload-card";
import UploadSkeleton from "./upload-skeleton";
import { useGalleryItems } from "../_hooks/use-gallery-items";

import type { GalleryItem } from "../_hooks/use-gallery-items";
import type { UploadWithDetails } from "@/lib/types";

import { useIsMobile } from "@/hooks/use-mobile";

interface MasonryGridProps {
  uploads?: UploadWithDetails[];
  relatedUploads?: UploadWithDetails[];
  loading?: boolean;
  initialLoading?: boolean;
  isReachingEnd?: boolean;
  layout?: "feed" | "details";
}

const MasonryGrid = ({
  uploads,
  relatedUploads,
  loading = false,
  initialLoading = false,
  isReachingEnd = true,
  layout = "feed",
}: MasonryGridProps) => {
  const isMobile = useIsMobile();

  const feedSkeletonCount = initialLoading ? 30 : 10;

  const galleryItems = useGalleryItems(
    uploads ?? [],
    loading ?? false,
    initialLoading ?? false,
    isReachingEnd ?? true,
    feedSkeletonCount,
  );

  const relatedItems = useGalleryItems(
    relatedUploads ?? [],
    loading ?? false,
    initialLoading ?? false,
    isReachingEnd ?? true,
    10,
  );

  if (layout === "feed" && uploads) {
    return (
      <Masonry
        items={galleryItems}
        columnWidth={isMobile ? 160 : 260}
        columnGutter={isMobile ? 4 : 20}
        render={({ data }: { data: GalleryItem }) => {
          if (data.type === "skeleton") {
            if (data.hidden) return null;
            return <UploadSkeleton height={data.height} />;
          }
          return <UploadCard upload={data.upload} />;
        }}
      />
    );
  }

  if (layout === "details" && relatedUploads) {
    return (
      <Masonry
        items={relatedItems}
        columnWidth={isMobile ? 160 : 260}
        columnGutter={isMobile ? 4 : 20}
        render={({ data }: { data: GalleryItem }) => {
          if (data.type === "skeleton") {
            if (data.hidden) return null;
            return <UploadSkeleton height={data.height} />;
          }
          return <UploadCard upload={data.upload} />;
        }}
      />
    );
  }

  return null;
};

export default MasonryGrid;
