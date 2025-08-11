"use client";

import dynamic from "next/dynamic";

import { useProfileUploads } from "../_hooks/use-profile-uploads";

import Loader from "@/components/loader";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useUser } from "@/hooks/use-user";

const MasonryGrid = dynamic(
  () => import("@/app/feed/_components/masonry-grid"),
  {
    ssr: false,
  },
);

const ProfileUploads = () => {
  const { user } = useUser();
  const username = user?.profile.username;

  const { uploads, isLoadingInitial, isLoadingMore, isReachingEnd, loadMore } =
    useProfileUploads(username!);

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
