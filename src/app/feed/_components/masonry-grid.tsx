"use client";

import { Masonry } from "masonic";

import UploadCard from "./upload-card";
import UploadSkeleton from "./upload-skeleton";
import { useGalleryItems } from "../_hooks/use-gallery-items";

import type {
  UploadWithDetails,
  UploadWithProfileAndAspect,
} from "@/lib/types";

import { useIsMobile } from "@/hooks/use-mobile";

interface MasonryGridProps {
  uploads?: UploadWithDetails[];
  relatedUploads?: UploadWithProfileAndAspect[];
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
        columnWidth={isMobile ? 160 : 240}
        columnGutter={isMobile ? 4 : 20}
        render={({ data }) => {
          if (data.type === "upload") {
            return <UploadCard upload={data.upload} />;
          }

          if ((data as any).hidden) return null;

          return <UploadSkeleton aspectRatio={data.aspectRatio} />;
        }}
      />
    );
  }

  if (layout === "details" && relatedUploads) {
    return (
      <Masonry
        items={relatedItems}
        columnWidth={isMobile ? 160 : 240}
        columnGutter={isMobile ? 4 : 20}
        render={({ data }) => {
          if (data.type === "upload") {
            return <UploadCard upload={data.upload} />;
          }
          if ((data as any).hidden) return null;

          return <UploadSkeleton aspectRatio={data.aspectRatio} />;
        }}
      />
    );
  }

  return null;
};

export default MasonryGrid;
