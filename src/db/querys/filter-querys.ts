"use server";

import { desc, isNotNull, eq, inArray } from "drizzle-orm";

import { db } from "../db";
import { tags, uploads, games } from "../schema";

import type { FilterOptions, SearchSuggestion } from "@/lib/types";

export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    const platformsResult = await db
      .selectDistinct({ platforms: games.platforms })
      .from(games)
      .where(isNotNull(games.platforms));

    const platforms = platformsResult
      .map((p) => p.platforms)
      .filter((platform) => platform !== null)
      .flatMap((platform) => platform!.split(",").map((p) => p.trim()))
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();

    const yearsResult = await db
      .selectDistinct({ releaseYear: games.releaseYear })
      .from(games)
      .where(isNotNull(games.releaseYear))
      .orderBy(games.releaseYear);

    const tagsResult = await db
      .selectDistinct({ name: tags.name })
      .from(tags)
      .orderBy(tags.name);

    return {
      platforms,
      releaseYears: yearsResult
        .map((y) => y.releaseYear)
        .filter(Boolean) as number[],
      tags: tagsResult.map((t) => t.name),
    };
  } catch (error) {
    console.error("Error al obtener opciones de filtro:", error);
    throw error;
  }
}

export async function getSearchSuggestions(): Promise<SearchSuggestion[]> {
  try {
    const popularUploads = await db
      .select({
        id: uploads.id,
        title: uploads.title,
        imageUrl: uploads.imageUrl,
        gameId: uploads.gameId,
        publicId: uploads.publicId,
      })
      .from(uploads)
      .orderBy(desc(uploads.createdAt))
      .limit(12);

    const gameIds = popularUploads.map((u) => u.gameId).filter(Boolean);
    let gameNames: Record<string, string> = {};
    if (gameIds.length > 0) {
      const gamesResult = await db
        .select({ id: games.id, name: games.name })
        .from(games)
        .where(
          gameIds.length === 1
            ? eq(games.id, gameIds[0])
            : inArray(games.id, gameIds),
        );
      gameNames = Object.fromEntries(gamesResult.map((g) => [g.id, g.name]));
    }

    return popularUploads.map((upload) => ({
      id: upload.id,
      title: upload.title,
      imageUrl: upload.imageUrl,
      category: gameNames[upload.gameId] || "HUD",
      publicId: upload.publicId,
    }));
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}
