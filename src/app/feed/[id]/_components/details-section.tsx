"use client";

import {
  IconDeviceGamepad2,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import TurndownService from "turndown";

import { Markdown } from "@/components/markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BetterTooltip } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

import CommentsBox from "./comments-box";
import { getTranslatedGenres, mapComment } from "../../_lib/utils";

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

  const [isTranslated, setIsTranslated] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [translatedDescription, setTranslatedDescription] = useState<
    string | null
  >(null);

  const isMobile = useIsMobile();

  let gameDescriptionMarkdown = "";
  if (upload.game?.description && upload.game.description.trim()) {
    const turndownService = new TurndownService();
    gameDescriptionMarkdown = turndownService.turndown(upload.game.description);
  }

  const scrollToComments = () => {
    const el = document.getElementById("comments-box");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleToggleTranslation = async () => {
    if (!isTranslated) {
      if (!translatedDescription) {
        setLoadingTranslation(true);
        try {
          if ("Translator" in window) {
            const translator = await window.Translator.create({
              sourceLanguage: "en",
              targetLanguage: "es",
            });
            const translated = await translator.translate(
              upload.game.description!,
            );
            const turndownService = new TurndownService();
            const translatedMarkdown = turndownService.turndown(translated);
            setTranslatedDescription(translatedMarkdown);
          }
        } finally {
          setLoadingTranslation(false);
        }
      }
      setIsTranslated(true);
    } else {
      setIsTranslated(false);
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
              <BetterTooltip content={favoriteTooltip}>
                <Button
                  variant={favorite ? "primary" : "default"}
                  size="icon-lg"
                  onClick={() => setFavorite(!favorite)}
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
            <div id="comments-box" className="mt-3">
              <CommentsBox
                commentCount={upload.commentsCount!}
                comments={mappedComments}
                open={openComments}
                onOpenChange={setOpenComments}
              />
            </div>
          </div>
        </section>
      </article>
      <section className="sticky top-20 z-2 flex flex-col p-3 md:p-4">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <IconDeviceGamepad2 />
          Información del videojuego
        </h2>
        {upload.game && (
          <div className="bg-base-200 rounded-box p-6 shadow-lg">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              {upload.game.coverUrl && (
                <div className="bg-base-100 rounded-box flex h-28 w-28 flex-shrink-0 items-center justify-center p-2">
                  <Image
                    src={upload.game.coverUrl}
                    alt={upload.game.name}
                    width={200}
                    height={200}
                    className="aspect-square rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-base-content flex items-center gap-2 text-2xl leading-tight font-semibold">
                  {upload.game.name}
                  {upload.game.releaseYear && (
                    <span className="bg-base-300 ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                      {upload.game.releaseYear}
                    </span>
                  )}
                </h3>
                {upload.game.genre && (
                  <span className="text-base-content/70 flex flex-wrap gap-1 text-sm font-medium">
                    {getTranslatedGenres(upload.game.genre).map(
                      (translated) => (
                        <Badge
                          key={translated}
                          variant="default"
                          size="sm"
                          className="border-0"
                        >
                          {translated}
                        </Badge>
                      ),
                    )}
                  </span>
                )}
                {upload.game.rating && (
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-yellow-500">
                    <IconStarFilled className="inline size-4" />
                    {upload.game.rating}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <Markdown className="text-base-content/80 text-sm">
                {isTranslated && translatedDescription
                  ? translatedDescription
                  : gameDescriptionMarkdown}
              </Markdown>
              <Button
                disabled={loadingTranslation}
                outline
                size="sm"
                className="mt-2"
                onClick={handleToggleTranslation}
              >
                {loadingTranslation
                  ? "Traduciendo..."
                  : isTranslated
                    ? "Ver original"
                    : "Traducir descripción"}
              </Button>
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {upload.game.platforms && (
                <span className="bg-base-300 flex items-center gap-1 rounded-full px-3 py-1 font-semibold">
                  <span role="img" aria-label="plataformas">
                    🖥️
                  </span>{" "}
                  {upload.game.platforms}
                </span>
              )}
              {upload.game.developer && (
                <span className="bg-base-300 flex items-center gap-1 rounded-full px-3 py-1 font-semibold">
                  <span role="img" aria-label="dev">
                    👨‍💻
                  </span>{" "}
                  {upload.game.developer}
                </span>
              )}
              {upload.game.publisher && (
                <span className="bg-base-300 flex items-center gap-1 rounded-full px-3 py-1 font-semibold">
                  <span role="img" aria-label="publisher">
                    🏢
                  </span>{" "}
                  {upload.game.publisher}
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default DetailsSection;
