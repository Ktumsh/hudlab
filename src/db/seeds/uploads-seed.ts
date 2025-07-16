import { eq } from "drizzle-orm";

import { db } from "../db";
import { uploads, uploadTags, profiles, tags } from "../schema";
import "dotenv/config";

const RAWG_API_KEY = process.env.RAWG_API_KEY!;

async function fetchScreenshots(rawgId: number): Promise<string[]> {
  const res = await fetch(
    `https://api.rawg.io/api/games/${rawgId}/screenshots?key=${RAWG_API_KEY}`,
  );
  const data = await res.json();
  return (data.results || []).map((s: any) => s.image).slice(0, 4);
}

async function seedUploadsFromGames(limit = 25) {
  // 1. Verificar si existe el perfil DEMO
  const demoProfile = await db.query.profiles.findFirst({
    where: eq(profiles.username, "demo"),
  });

  if (!demoProfile) {
    throw new Error(
      "⚠️ No se encontró el perfil con username 'demo'. Crea uno antes de correr la seed.",
    );
  }

  // 2. Cargar tags de ejemplo para asociar
  const hudTag = await db.query.tags.findFirst({ where: eq(tags.name, "HUD") });
  const minimalTag = await db.query.tags.findFirst({
    where: eq(tags.name, "Minimalista"),
  });

  const validTags = [hudTag, minimalTag].filter(Boolean);

  if (validTags.length === 0) {
    throw new Error("⚠️ No se encontraron las tags 'HUD', 'Minimalista'.");
  }

  const games = await db.query.games.findMany({ limit });
  let total = 0;

  for (const game of games) {
    if (!game.rawgId) continue;

    const screenshots = await fetchScreenshots(game.rawgId);

    for (const [index, imageUrl] of screenshots.entries()) {
      const tagsString = validTags.map((tag) => tag!.name).join(",");

      const [upload] = await db
        .insert(uploads)
        .values({
          profileId: demoProfile.id,
          gameId: game.id,
          title: `${game.name} HUD #${index + 1}`,
          description: `Captura automática de HUD para ${game.name}`,
          imageUrl,
          type: "hud",
          tags: tagsString,
        })
        .returning();

      const uploadTagValues = validTags.map((tag) => ({
        uploadId: upload.id,
        tagId: tag!.id,
      }));

      if (uploadTagValues.length > 0) {
        await db.insert(uploadTags).values(uploadTagValues);
      }

      console.log(`✅ Insertado HUD: ${game.name} (${index + 1})`);
      total++;
    }
  }

  console.log(`🎯 Seed de uploads completada → ${total} HUDs insertados.`);
}

seedUploadsFromGames();
