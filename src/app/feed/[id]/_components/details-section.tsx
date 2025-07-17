"use client";

import {
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BetterTooltip } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";

import CommentsBox from "./comments-box";
import GameInfoSection from "./game-info-section";
import UnauthenticatedComments from "./unauthenticated-comments";
import { mapComment } from "../../_lib/utils";

import type { UploadWithDetails, UploadWithFullDetails } from "@/lib/types";

interface DetailsSectionProps {
  upload: UploadWithDetails;
}

const DetailsSection = ({ upload }: DetailsSectionProps) => {
  const displayName = upload.profile.displayName || upload.profile.username;
  const avatarFallback = displayName.charAt(0).toUpperCase();

  const [favorite, setFavorite] = useState(false);
  const [liked, setLiked] = useState(false);

  const [openComments, setOpenComments] = useState(false);

  const isMobile = useIsMobile();

  const { user } = useUser();

  const scrollToComments = () => {
    const el = document.getElementById("comments-box");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const favoriteTooltip = favorite
    ? "Quitar de favoritos"
    : "Añadir a favoritos";

  const currentUserId = undefined;

  const mappedComments = Array.isArray(
    (upload as UploadWithFullDetails).comments,
  )
    ? (upload as UploadWithFullDetails).comments.map((c) =>
        mapComment(c, currentUserId),
      )
    : [];

  return (
    <>
      <article className="bg-base-100 relative gap-0 p-0">
        <section className="rounded-box md:border">
          <div className="relative flex flex-col md:mx-4">
            <div className="bg-base-100 top-20 order-2 flex items-center justify-between gap-2 py-4 pr-3 pl-0.5 md:sticky md:order-0 md:px-0">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <BetterTooltip content="Me gusta">
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => setLiked(!liked)}
                      >
                        {liked ? (
                          <IconHeartFilled className="size-6 text-red-500" />
                        ) : (
                          <IconHeart className="size-6" />
                        )}
                        <span className="sr-only">Me gusta</span>
                      </Button>
                    </BetterTooltip>
                    <span>{upload.likesCount}</span>
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
                    <span className="md:hidden">{upload.commentsCount}</span>
                  </div>
                </div>
              )}
              <BetterTooltip content={favoriteTooltip}>
                <Button
                  variant={favorite ? "primary" : "default"}
                  size="icon-lg"
                  onClick={() => setFavorite(!favorite)}
                  className="ms-auto"
                >
                  {favorite ? (
                    <IconStarFilled className="size-6" />
                  ) : (
                    <IconStar className="size-6" />
                  )}
                  <span className="sr-only">{favoriteTooltip}</span>
                </Button>
              </BetterTooltip>
            </div>
            <div className="hidden aspect-3/2 flex-1 place-content-center md:grid">
              <Image
                priority
                src={upload.imageUrl}
                alt={upload.title}
                width={900}
                height={600}
                className="rounded-box w-auto object-contain"
              />
            </div>
            <Image
              priority
              src={upload.imageUrl}
              alt={upload.title}
              width={900}
              height={600}
              className="rounded-box mt-2 h-full w-auto object-cover md:hidden"
            />
          </div>
          <div className="p-3 pt-0 md:p-4">
            <div className="mb-2 flex items-center gap-2">
              <Avatar className="border-content-muted size-7 border-2">
                <AvatarImage src={upload.profile.avatarUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <p className="text-base-content truncate text-sm font-medium">
                {displayName}
              </p>
            </div>
            <h1 className="text-base-content mb-1 text-xl font-bold">
              {upload.title}
            </h1>
            {upload.description && (
              <p className="text-base-content/80 mb-2 truncate text-base">
                {upload.description}
              </p>
            )}
            <div className="mb-2 flex flex-wrap gap-2">
              {upload.tags &&
                typeof upload.tags === "string" &&
                upload.tags.trim().length > 0 &&
                upload.tags.split(",").map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-base-300 text-base-content/80 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    #{tag.trim()}
                  </span>
                ))}
            </div>
            <Separator className="mt-6" />
            {user ? (
              <div id="comments-box" className="mt-3">
                <CommentsBox
                  commentCount={upload.commentsCount!}
                  comments={mappedComments}
                  open={openComments}
                  onOpenChange={setOpenComments}
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
