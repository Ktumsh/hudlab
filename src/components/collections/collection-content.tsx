"use client";

import { IconFolderOpen } from "@tabler/icons-react";
import dynamic from "next/dynamic";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/hooks/profile/use-collection";
import { useCollectionRole } from "@/hooks/profile/use-collection-role";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const MasonryGrid = dynamic(
  () => import("@/app/feed/_components/masonry-grid"),
  {
    ssr: false,
  },
);

interface CollectionContentProps {
  username: string;
  slug: string;
}

const CollectionContent = ({ username, slug }: CollectionContentProps) => {
  const {
    collection,
    uploads,
    isLoadingInitial,
    isLoadingMore,
    isReachingEnd,
    loadMore,
  } = useCollection(username, slug, { withInfiniteUploads: true });

  const { canEdit } = useCollectionRole(collection);

  useInfiniteScroll({
    disabled: isLoadingInitial || isLoadingMore || !!isReachingEnd,
    onLoadMore: () => {
      if (loadMore) {
        loadMore();
      }
    },
  });

  if (isLoadingInitial) {
    return (
      <div className="py-16 text-center">
        <Loader className="mx-auto size-8" />
      </div>
    );
  }

  if (collection && uploads && uploads.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="bg-base-200 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <IconFolderOpen className="text-base-content/40 h-12 w-12" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Colección vacía</h3>
        <p className="text-base-content/70 mb-6">
          {canEdit
            ? "Esta colección aún no tiene ningún upload. Comienza agregando tu primer item."
            : "Esta colección aún no tiene contenido."}
        </p>
        {canEdit && <Button>Explorar Uploads</Button>}
      </div>
    );
  }

  return (
    <>
      <MasonryGrid uploads={uploads} initialLoading={isLoadingInitial} />
      <div className="relative z-2 mt-6 mb-24 flex flex-col items-center gap-2 md:mb-32">
        {isLoadingMore && <Loader className="mx-auto size-6" />}
      </div>
    </>
  );
};

export default CollectionContent;
