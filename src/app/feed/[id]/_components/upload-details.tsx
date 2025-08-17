"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import DetailsSection from "./details-section";
import FooterStatus from "../../_components/footer-status";

import type { UploadWithDetails } from "@/lib/types";

import { usePaginatedRelatedUploads } from "@/app/feed/_hooks/use-paginated-related-uploads";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const MasonryGrid = dynamic(() => import("../../_components/masonry-grid"), {
  ssr: false,
});

interface UploadDetailsProps {
  upload: UploadWithDetails;
  initialLiked?: boolean;
}

const UploadDetails = ({
  upload,
  initialLiked = false,
}: UploadDetailsProps) => {
  const router = useRouter();
  const {
    uploads: relatedUploads,
    isLoadingInitial,
    isLoadingMore,
    isReachingEnd,
    loadMore,
  } = usePaginatedRelatedUploads({
    gameId: upload.game?.id ?? "",
    tags: upload.tags?.map((tag) => tag.name).join(",") ?? "",
    excludeId: upload.id,
  });

  useInfiniteScroll({
    disabled: isLoadingInitial || isLoadingMore || isReachingEnd,
    onLoadMore: loadMore,
  });

  return (
    <div className="mx-auto flex flex-col px-1 md:flex-row md:px-6">
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => router.back()}
        className="sticky top-20 mr-2 hidden md:flex"
      >
        <IconArrowLeft className="size-6!" />
        <span className="sr-only">Volver</span>
      </Button>
      <div className="w-full max-w-4xl md:mr-5">
        <DetailsSection upload={upload} initialLiked={initialLiked} />
      </div>
      <div className="w-full">
        <h2 className="mb-2 px-3 font-semibold">Relacionados</h2>
        <MasonryGrid
          key={upload.id}
          relatedUploads={relatedUploads}
          layout="details"
          initialLoading={isLoadingInitial}
        />
        <FooterStatus
          isLoadingInitial={isLoadingInitial}
          isLoadingMore={isLoadingMore}
          isReachingEnd={isReachingEnd}
          hasUploads={relatedUploads.length > 0}
          className="mb-20 md:mb-14"
        />
      </div>
    </div>
  );
};

export default UploadDetails;
