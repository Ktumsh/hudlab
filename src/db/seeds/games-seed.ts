import { eq } from "drizzle-orm";

import "dotenv/config";
import { games } from "@/db/schema";

import { db } from "../db";

export async function seedGames() {
  const startPage = 41; // ✅ Cambia esto según el último grupo que insertaste
  const totalPages = 60; // por ejemplo: páginas 21 a 60

  for (let page = startPage; page <= totalPages; page++) {
    const res = await fetch(
      `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&ordering=-added&page_size=100&page=${page}`
    );

    if (!res.ok) {
      console.error(`❌ Error en página ${page}:`, await res.text());
      continue;
    }

    const data = await res.json();
    const topGames = data.results;

    let inserted = 0;
    let skipped = 0;

    for (const game of topGames) {
      const exists = await db.query.games.findFirst({
        where: eq(games.rawgId, game.id),
      });

      if (exists) {
        skipped++;
        continue;
      }

      try {
        const detailRes = await fetch(
          `https://api.rawg.io/api/games/${game.id}?key=${process.env.RAWG_API_KEY}`
        );

        if (!detailRes.ok) {
          console.warn(`⚠️ No se pudo obtener detalles de ${game.name}`);
          skipped++;
          continue;
        }

        const detail = await detailRes.json();

        await db.insert(games).values({
          rawgId: game.id,
          name: game.name,
          genre: game.genres.map((g: any) => g.name).join(", "),
          platforms: game.platforms
            ?.map((p: any) => p.platform.name)
            .join(", "),
          developer: detail.developers?.[0]?.name ?? null,
          publisher: detail.publishers?.[0]?.name ?? null,
          shortDescription: detail.description_raw?.slice(0, 300) ?? null,
          description: detail.description ?? null,
          coverUrl: game.background_image,
          coverUrlHd: game.background_image_additional ?? null,
          rating: Math.round(game.rating * 20),
          releaseYear: parseInt(game.released?.slice(0, 4)) || null,
        });

        inserted++;
      } catch (err) {
        console.error(`❌ Error al insertar ${game.name}:`, err);
      }
    }

    console.log(
      `📦 Página ${page} procesada → Insertados: ${inserted}, Omitidos: ${skipped}`
    );
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("🎮 Seed completo con juegos nuevos desde RAWG");
}

seedGames();
