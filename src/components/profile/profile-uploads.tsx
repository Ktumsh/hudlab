"use client";

import dynamic from "next/dynamic";

import Loader from "@/components/loader";
import { useProfileUploads } from "@/hooks/profile/use-profile-uploads";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const MasonryGrid = dynamic(
  () => import("@/app/feed/_components/masonry-grid"),
  {
    ssr: false,
  },
);

const ProfileUploads = ({ username }: { username: string }) => {
  const { uploads, isLoadingInitial, isLoadingMore, isReachingEnd, loadMore } =
    useProfileUploads(username);

  useInfiniteScroll({
    disabled: isLoadingInitial || isLoadingMore || !!isReachingEnd,
    onLoadMore: loadMore,
  });

  return (
    <>
      <MasonryGrid uploads={uploads} initialLoading={isLoadingInitial} />
      <div className="relative z-2 mt-6 mb-24 flex flex-col items-center gap-2 md:mb-32">
        {isLoadingMore && <Loader className="mx-auto size-6" />}
      </div>
    </>
  );
};

export default ProfileUploads;
