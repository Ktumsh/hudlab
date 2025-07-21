"use client";

import {
  IconDeviceGamepad2,
  IconStarFilled,
  IconUsers,
  IconBuilding,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import TurndownService from "turndown";

import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandableText } from "@/hooks/use-expandable-text";
import { parsePlatforms, formatRating } from "@/lib";

import { getTranslatedGenres } from "../../_lib/utils";

import type { Game } from "@/db/schema";

interface GameInfoSectionProps {
  game: Game;
}

const GameInfoSection = ({ game }: GameInfoSectionProps) => {
  const [translatorAvailable, setTranslatorAvailable] =
    useState<boolean>(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [translatedDescription, setTranslatedDescription] = useState<
    string | null
  >(null);
  const [error, setError] = useState<boolean>(false);

  let gameDescriptionMarkdown = "";
  if (game?.description && game.description.trim()) {
    const turndownService = new TurndownService();
    gameDescriptionMarkdown = turndownService.turndown(game.description);
  }

  // Hook para la descripción expandible
  const {
    contentRef,
    isExpanded,
    showExpandButton,
    contentHeight,
    toggleExpanded,
  } = useExpandableText(
    isTranslated && translatedDescription
      ? translatedDescription
      : gameDescriptionMarkdown,
    {
      collapsedHeight: 128,
    },
  );

  useEffect(() => {
    if (typeof window !== "undefined" && window.Translator) {
      setTranslatorAvailable(true);
    }
  }, []);

  const handleToggleTranslation = async () => {
    if (!isTranslated) {
      if (!translatedDescription) {
        setLoadingTranslation(true);
        try {
          if (translatorAvailable) {
            const translator = await window.Translator.create({
              sourceLanguage: "en",
              targetLanguage: "es",
            });
            const translated = await translator.translate(game.description!);
            const turndownService = new TurndownService();
            const translatedMarkdown = turndownService.turndown(translated);
            setTranslatedDescription(translatedMarkdown);
          }
        } catch {
          setError(true);
        } finally {
          setLoadingTranslation(false);
        }
      }
      setIsTranslated(true);
    } else {
      setIsTranslated(false);
    }
  };

  return (
    <section className="sticky top-20 z-2 flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden p-3 md:p-4">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <IconDeviceGamepad2 />
        Información del videojuego
      </h2>
      {game && (
        <div className="bg-base-200 rounded-box scrollbar-sm flex-1 overflow-auto p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            {game.coverUrl && (
              <div className="bg-base-100 rounded-box flex h-28 w-28 flex-shrink-0 items-center justify-center p-2">
                <Image
                  src={game.coverUrl}
                  alt={game.name}
                  width={200}
                  height={200}
                  className="aspect-square rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-neutral-content flex items-center gap-2 text-2xl leading-tight font-semibold">
                {game.name}
                {game.releaseYear && (
                  <Badge variant="accent" size="sm">
                    {game.releaseYear}
                  </Badge>
                )}
              </h3>
              {game.genre && (
                <span className="text-base-content/70 flex flex-wrap gap-1 text-sm font-medium">
                  {getTranslatedGenres(game.genre).map((translated) => (
                    <Badge
                      key={translated}
                      variant="default"
                      size="sm"
                      className="border-0"
                    >
                      {translated}
                    </Badge>
                  ))}
                </span>
              )}
              {game.rating && formatRating(game.rating) && (
                <span
                  title="Valoración"
                  className="text-warning mt-1 inline-flex items-center gap-1 text-sm font-semibold"
                >
                  <IconStarFilled className="inline size-4" />
                  {formatRating(game.rating)}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <motion.div
                ref={contentRef}
                className="relative overflow-hidden"
                initial={false}
                animate={{
                  maxHeight: contentHeight,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                <Markdown className="text-base-content/80 text-sm">
                  {isTranslated && translatedDescription
                    ? translatedDescription
                    : gameDescriptionMarkdown}
                </Markdown>
              </motion.div>
              {!isExpanded && showExpandButton && (
                <div className="from-base-200 pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t to-transparent" />
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {showExpandButton && (
                <Button size="sm" outline onClick={toggleExpanded}>
                  {isExpanded ? "Mostrar menos" : "Mostrar más"}
                </Button>
              )}
              {translatorAvailable && (
                <Button
                  disabled={loadingTranslation}
                  size="sm"
                  outline
                  onClick={handleToggleTranslation}
                >
                  {error
                    ? "No pudimos traducir la descripción :("
                    : loadingTranslation
                      ? "Traduciendo..."
                      : isTranslated
                        ? "Ver original"
                        : "Traducir descripción"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {game.platforms && (
              <div>
                <h4 className="text-base-content/70 mb-2 text-sm font-medium">
                  Plataformas disponibles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parsePlatforms(game.platforms).map(
                    ({ name, Icon }, index) => (
                      <div
                        key={`${name}-${index}`}
                        className="bg-base-300/50 hover:bg-base-300 group relative flex size-10 items-center justify-center rounded-lg transition-colors"
                        title={name}
                      >
                        <Icon className="text-base-content/70 group-hover:text-base-content size-5 transition-colors" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {game.developer && (
                <div>
                  <h4 className="text-base-content/70 mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconUsers className="size-4" />
                    Desarrollador
                  </h4>
                  <Badge variant="accent" className="text-xs">
                    {game.developer}
                  </Badge>
                </div>
              )}
              {game.publisher && (
                <div>
                  <h4 className="text-base-content/70 mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconBuilding className="size-4" />
                    Editor
                  </h4>
                  <Badge variant="accent" className="text-xs">
                    {game.publisher}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GameInfoSection;
