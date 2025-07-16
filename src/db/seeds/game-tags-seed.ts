import { sql } from "drizzle-orm";

import { db } from "../db";
import { TAG_TRANSLATIONS } from "../local/tags";
import { gameTags } from "../schema";

import "dotenv/config";

// Función para limpiar y normalizar texto
function normalizeText(text: string): string {
  return text
    .normalize("NFD") // separar tildes
    .replace(/[\u0300-\u036f]/g, "") // eliminar tildes
    .replace(/[^\w\s]/g, "") // eliminar signos
    .toLowerCase();
}

function textMatchesKeyword(text: string, keyword: string): boolean {
  const parts = keyword.toLowerCase().split(" ");
  return parts.every((part) => text.includes(part));
}

export async function seedGameTags() {
  const allTags = await db.query.tags.findMany();
  const tagMap = new Map<string, string>(); // nombre tag español → id

  for (const tag of allTags) {
    tagMap.set(tag.name.toLowerCase(), tag.id);
  }

  const gamesWithoutTags = await db.execute(
    sql`
      SELECT g.*
      FROM games g
      LEFT JOIN game_tags gt ON g.id = gt.game_id
      WHERE gt.game_id IS NULL
    `
  );

  let totalInserted = 0;

  for (const game of gamesWithoutTags) {
    const { id, name, description = "", shortDescription = "" } = game as any;
    const fullText = normalizeText(
      `${name} ${description} ${shortDescription}`
    );

    const matchingTagIds: string[] = [];

    for (const [tagNameEs, tagKeywords] of Object.entries(TAG_TRANSLATIONS)) {
      const keywords = Array.isArray(tagKeywords) ? tagKeywords : [tagKeywords];

      for (const keyword of keywords) {
        if (textMatchesKeyword(fullText, normalizeText(keyword))) {
          const tagId = tagMap.get(tagNameEs.toLowerCase());
          if (tagId && !matchingTagIds.includes(tagId)) {
            matchingTagIds.push(tagId);
          }
          break;
        }
      }
    }

    if (matchingTagIds.length > 0) {
      const values = matchingTagIds.map((tagId) => ({
        gameId: id,
        tagId,
      }));

      await db.insert(gameTags).values(values).onConflictDoNothing();
      totalInserted += values.length;

      console.log(`✅ Juego: ${name} → ${values.length} tags`);
    } else {
      console.log(`⏩ Juego: ${name} → sin tags coincidentes`);
    }
  }

  console.log(
    `🎯 Seed actualizado → total nuevas asociaciones insertadas: ${totalInserted}`
  );
}

seedGameTags();
