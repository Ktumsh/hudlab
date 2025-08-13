"use client";

import {
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import CommentsBox from "./comments-box";
import GameInfoSection from "./game-info-section";
import ImageCarousel from "./image-carousel";
import UnauthenticatedComments from "./unauthenticated-comments";

import type { UploadWithDetails } from "@/lib/types";

import AddToCollectionButton from "@/components/collections/add-to-collection-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BetterTooltip } from "@/components/ui/tooltip";
import UserAvatar from "@/components/user-avatar";
import { useExpandableText } from "@/hooks/use-expandable-text";
import { useFilters } from "@/hooks/use-filters";
import { useInteractions } from "@/hooks/use-interactions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";

interface DetailsSectionProps {
  upload: UploadWithDetails;
  initialLiked?: boolean;
}

const DetailsSection = ({
  upload,
  initialLiked = false,
}: DetailsSectionProps) => {
  const displayName = upload.profile.displayName || upload.profile.username;

  const [openComments, setOpenComments] = useState(false);

  const isMobile = useIsMobile();
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { setFilters } = useFilters();

  const {
    isLiked,
    likesCount,
    commentsCount,
    handleToggleLike,
    updateCommentsCount,
  } = useInteractions({
    uploadId: upload.id,
    initialLiked: initialLiked,
    initialLikesCount: upload.likesCount || 0,
    initialCommentsCount: upload.commentsCount || 0,
  });

  const {
    contentRef: descriptionRef,
    isExpanded: isDescriptionExpanded,
    showExpandButton: showDescriptionExpandButton,
    contentHeight: descriptionHeight,
    toggleExpanded: toggleDescriptionExpanded,
  } = useExpandableText(upload.description, {
    collapsedHeight: 24,
  });

  const adjustedDescriptionHeight =
    isDescriptionExpanded && showDescriptionExpandButton
      ? descriptionHeight + 32
      : descriptionHeight;

  const scrollToComments = () => {
    const el = document.getElementById("comments-box");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleToggleDescription = () => {
    toggleDescriptionExpanded();
  };

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.trim();

    setFilters({
      searchText: cleanTag,
      tags: [cleanTag],
      platform: undefined,
      releaseYear: undefined,
      inMyCollections: false,
      sortBy: "newest",
    });

    router.push("/feed");
  };

  return (
    <>
      <article className="bg-base-100 relative z-2 gap-0 p-0">
        <section className="rounded-box md:border">
          <div className="relative flex flex-col md:mx-4">
            <div className="bg-base-100 top-20 z-1 order-2 flex items-center justify-between gap-2 py-4 pr-3 pl-0.5 md:sticky md:order-0 md:px-0">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <BetterTooltip content="Me gusta">
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={handleToggleLike}
                      >
                        {isLiked ? (
                          <IconHeartFilled className="text-error size-6" />
                        ) : (
                          <IconHeart className="size-6" />
                        )}
                        <span className="sr-only">Me gusta</span>
                      </Button>
                    </BetterTooltip>
                    <span>{likesCount}</span>
                  </div>
                  <div className="flex items-center">
                    <BetterTooltip content="Comentar">
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => {
                          if (isMobile) {
                            setOpenComments(true);
                            return;
                          }
                          scrollToComments();
                        }}
                      >
                        <IconMessageCircle className="size-6" />
                        <span className="sr-only">Comentar</span>
                      </Button>
                    </BetterTooltip>
                    <span className="md:hidden">{commentsCount}</span>
                  </div>
                </div>
              )}
              <AddToCollectionButton
                uploadId={upload.id}
                variant="details"
                className="ms-auto"
              />
            </div>
            <ImageCarousel images={upload.images} title={upload.title} />
          </div>
          <div className="p-3 pt-0 md:p-4">
            <div className="mb-2 flex items-center gap-2">
              <UserAvatar profile={upload.profile} className="size-5" />
              <p className="text-base-content truncate text-sm font-medium">
                {displayName}
              </p>
            </div>
            <h1 className="text-neutral-content mb-1 text-xl font-bold">
              {upload.title}
            </h1>
            {upload.description && (
              <div className="mb-2">
                <motion.div
                  className="overflow-hidden"
                  initial={false}
                  animate={{
                    height: adjustedDescriptionHeight,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative">
                    <motion.div
                      ref={descriptionRef}
                      className="overflow-hidden"
                      initial={false}
                      animate={{
                        maxHeight: isDescriptionExpanded
                          ? descriptionHeight
                          : 24,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="text-base-content/80 block text-base leading-6">
                        {upload.description}
                      </span>
                    </motion.div>
                    {!isDescriptionExpanded && showDescriptionExpandButton && (
                      <motion.div
                        key="expand-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                        className="to-base-100 pointer-events-none absolute right-14 bottom-0 left-0 h-6 bg-gradient-to-r from-transparent from-80%"
                      />
                    )}
                    {!isDescriptionExpanded && showDescriptionExpandButton && (
                      <motion.button
                        key="expand-button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                        onClick={handleToggleDescription}
                        className="text-primary bg-base-100 absolute right-0 bottom-0 pl-2 font-semibold transition-colors hover:underline"
                      >
                        ... más
                      </motion.button>
                    )}
                  </div>
                  <AnimatePresence>
                    {isDescriptionExpanded && showDescriptionExpandButton && (
                      <motion.button
                        key="collapse-button"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                        onClick={handleToggleDescription}
                        className="text-primary mt-1 font-semibold transition-colors hover:underline"
                      >
                        ... menos
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
            <div className="mb-2 flex flex-wrap gap-2">
              {upload.tags &&
                typeof upload.tags === "string" &&
                upload.tags.trim().length > 0 &&
                upload.tags.split(",").map((tag: string) => (
                  <span
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="text-primary cursor-pointer text-sm transition-colors hover:underline"
                  >
                    #{tag.trim()}
                  </span>
                ))}
            </div>
            {!isLoading && <Separator className="mt-6" />}
            {isLoading ? null : user ? (
              <div id="comments-box" className="mt-3">
                <CommentsBox
                  commentCount={commentsCount}
                  open={openComments}
                  onOpenChange={setOpenComments}
                  onCommentsCountChange={updateCommentsCount}
                  uploadId={upload.id}
                  publicId={upload.publicId.toString()}
                />
              </div>
            ) : (
              <UnauthenticatedComments />
            )}
          </div>
        </section>
      </article>
      <GameInfoSection game={upload.game} />
    </>
  );
};

export default DetailsSection;
