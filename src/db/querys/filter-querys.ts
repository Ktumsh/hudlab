"use server";

import { desc, isNotNull } from "drizzle-orm";

import { db } from "../db";
import { uploads, games } from "../schema";

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

    /* const tagsResult = await db
      .selectDistinct({ name: tags.name })
      .from(tags)
      .orderBy(tags.name); */

    return {
      platforms,
      releaseYears: yearsResult
        .map((y) => y.releaseYear)
        .filter(Boolean) as number[],
      /* tags: tagsResult.map((t) => t.name), */
    };
  } catch (error) {
    console.error("Error al obtener opciones de filtro:", error);
    throw error;
  }
}

export async function getSearchSuggestions(): Promise<SearchSuggestion[]> {
  try {
    const popularUploads = await db.query.uploads.findMany({
      orderBy: [desc(uploads.createdAt)],
      limit: 12,
      with: {
        images: {
          where: (uploadImages, { eq }) => eq(uploadImages.isMain, true),
          limit: 1,
        },
        game: {
          columns: { name: true },
        },
      },
    });

    return popularUploads.map((upload) => ({
      id: upload.id,
      title: upload.title,
      imageUrl: upload.images[0]?.imageUrl || "/placeholder-image.jpg",
      category: upload.game?.name || "HUD",
      publicId: upload.publicId,
    }));
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}
