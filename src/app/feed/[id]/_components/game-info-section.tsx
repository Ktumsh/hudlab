"use client";

import { IconDeviceGamepad2, IconStarFilled } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import TurndownService from "turndown";

import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <section className="sticky top-20 z-2 flex flex-col p-3 md:p-4">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <IconDeviceGamepad2 />
        Información del videojuego
      </h2>
      {game && (
        <div className="bg-base-200 rounded-box p-6 shadow-lg">
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
              <h3 className="text-base-content flex items-center gap-2 text-2xl leading-tight font-semibold">
                {game.name}
                {game.releaseYear && (
                  <span className="bg-base-300 ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {game.releaseYear}
                  </span>
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
              {game.rating && (
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-yellow-500">
                  <IconStarFilled className="inline size-4" />
                  {game.rating}
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
            {translatorAvailable && (
              <Button
                disabled={loadingTranslation}
                outline
                size="sm"
                className="mt-2"
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

          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {game.platforms && (
              <span className="bg-base-300 flex items-center gap-1 rounded-full px-3 py-1 font-semibold">
                <span role="img" aria-label="plataformas">
                  🖥️
                </span>{" "}
                {game.platforms}
              </span>
            )}
            {game.developer && (
              <span className="bg-base-300 flex items-center gap-1 rounded-full px-3 py-1 font-semibold">
                <span role="img" aria-label="dev">
                  👨‍💻
                </span>{" "}
                {game.developer}
              </span>
            )}
            {game.publisher && (
              <span className="bg-base-300 flex items-center gap-1 rounded-full px-3 py-1 font-semibold">
                <span role="img" aria-label="publisher">
                  🏢
                </span>{" "}
                {game.publisher}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default GameInfoSection;
