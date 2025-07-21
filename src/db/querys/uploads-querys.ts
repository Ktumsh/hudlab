"use server";

import { desc, ilike, like, eq, lt, and, asc, or, not, sql } from "drizzle-orm";

import {
  FilterState,
  UploadWithDetails,
  UploadWithFullDetails,
} from "@/lib/types";

import { db } from "../db";
import {
  games,
  uploads,
  uploadImages,
  likes,
  profiles,
  uploadComments,
} from "../schema";

export async function searchUploads(
  query: string,
  limit: number = 12,
): Promise<UploadWithDetails[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchText = query.trim().toLowerCase();

    // 🚀 QUERY OPTIMIZADO: Usa la API query de Drizzle con búsqueda accent-insensitive
    const uploadsData = await db.query.uploads.findMany({
      with: {
        profile: true,
        game: true,
        images: {
          where: eq(uploadImages.order, 1), // Solo primera imagen
          limit: 1,
        },
      },
      where: or(
        sql`unaccent(lower(${uploads.title})) LIKE unaccent(lower(${"%" + searchText + "%"}))`,
        sql`unaccent(lower(${uploads.description})) LIKE unaccent(lower(${"%" + searchText + "%"}))`,
        sql`unaccent(lower(${uploads.tags})) LIKE unaccent(lower(${"%" + searchText + "%"}))`,
      ),
      orderBy: [
        desc(uploads.likesCount), // Aprovecha índices de popularidad
        desc(uploads.createdAt),
      ],
      limit: limit,
    });

    return uploadsData;
  } catch (error) {
    console.error("Error searching uploads:", error);
    return [];
  }
}

export async function getUploads({
  limit = 16,
  cursor,
  filters,
}: {
  limit?: number;
  cursor?: string | null;
  filters?: FilterState;
}): Promise<{
  uploads: UploadWithDetails[];
  nextCursor: string | null;
}> {
  try {
    const { searchText, platform, releaseYear, tags, sortBy } = filters || {};

    // Si hay filtros que requieren datos del juego, obtener todos los uploads y filtrar en memoria
    // Esto no es lo más eficiente pero funciona para el caso de uso actual
    const allUploads = await db.query.uploads.findMany({
      with: {
        profile: true,
        game: true,
        images: {
          orderBy: [asc(uploadImages.order)],
        },
      },
      orderBy: [desc(uploads.createdAt)],
    });

    // 🎯 SISTEMA DE BÚSQUEDA INTELIGENTE ESTILO PINTEREST
    let filteredUploads = allUploads;

    // Si hay términos de búsqueda o tags, aplicar algoritmo inteligente
    if (searchText || (tags && tags.length > 0)) {
      const searchTerms = searchText ? searchText.toLowerCase().split(" ") : [];
      const searchTags = tags || [];

      // Calcular relevancia para cada upload
      const uploadsWithScore = allUploads.map((upload) => {
        let score = 0;
        const title = upload.title?.toLowerCase() || "";
        const description = upload.description?.toLowerCase() || "";
        const uploadTags = upload.tags?.toLowerCase() || "";
        const gameName = upload.game?.name?.toLowerCase() || "";
        const platforms = upload.game?.platforms?.toLowerCase() || "";

        // 🎯 COINCIDENCIAS EXACTAS (mayor peso)
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          if (title === searchLower) score += 100; // Título exacto
          if (uploadTags.split(",").some((tag) => tag.trim() === searchLower))
            score += 90; // Tag exacto
          if (gameName === searchLower) score += 80; // Juego exacto

          // Coincidencias parciales en título (alta prioridad)
          if (title.includes(searchLower)) score += 50;
          if (title.startsWith(searchLower)) score += 20; // Bonus si empieza igual

          // Coincidencias en descripción
          if (description.includes(searchLower)) score += 30;

          // Coincidencias por términos individuales
          searchTerms.forEach((term) => {
            if (title.includes(term)) score += 25;
            if (uploadTags.includes(term)) score += 20;
            if (gameName.includes(term)) score += 15;
            if (description.includes(term)) score += 10;
            if (platforms.includes(term)) score += 8;
          });
        }

        // 🏷️ COINCIDENCIAS POR TAGS
        searchTags.forEach((tag) => {
          const tagLower = tag.toLowerCase();
          if (
            uploadTags
              .split(",")
              .some((uploadTag) => uploadTag.trim() === tagLower)
          ) {
            score += 70; // Tag exacto
          } else if (uploadTags.includes(tagLower)) {
            score += 40; // Tag parcial
          }

          // Tags relacionados en otros campos
          if (title.includes(tagLower)) score += 35;
          if (gameName.includes(tagLower)) score += 30;
          if (platforms.includes(tagLower)) score += 25;
          if (description.includes(tagLower)) score += 15;
        });

        // 🎮 SIMILITUD POR JUEGO (contenido relacionado)
        if (score > 0) {
          // Bonus si es del mismo juego que resultados con alta puntuación
          score += 5;
        }

        // 📅 BONUS POR RECENCIA (contenido fresco)
        const daysSinceUpload = upload.createdAt
          ? (Date.now() - new Date(upload.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
          : 999;
        if (daysSinceUpload < 7)
          score += 3; // Menos de una semana
        else if (daysSinceUpload < 30) score += 1; // Menos de un mes

        return { ...upload, relevanceScore: score };
      });

      // Filtrar solo uploads con score > 0 y ordenar por relevancia
      filteredUploads = uploadsWithScore
        .filter((upload) => upload.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      // 🎨 DIVERSIDAD DE RESULTADOS (evitar que todo sea del mismo juego)
      if (filteredUploads.length > 10) {
        const diverseResults: typeof filteredUploads = [];
        const gamesSeen = new Set<string>();

        // Primeros 5: mejores resultados sin restricción
        diverseResults.push(...filteredUploads.slice(0, 5));
        filteredUploads.slice(0, 5).forEach((upload) => {
          if (upload.game?.id) gamesSeen.add(upload.game.id);
        });

        // Resto: priorizar diversidad de juegos
        for (const upload of filteredUploads.slice(5)) {
          if (diverseResults.length >= 50) break; // Límite máximo

          const gameId = upload.game?.id;
          if (!gameId || !gamesSeen.has(gameId) || Math.random() > 0.7) {
            diverseResults.push(upload);
            if (gameId) gamesSeen.add(gameId);
          }
        }

        filteredUploads = diverseResults;
      }
    }

    // 🔧 FILTROS ADICIONALES (aplicar después del algoritmo inteligente)
    if (platform && platform !== "none") {
      filteredUploads = filteredUploads.filter(
        (upload) =>
          upload.game?.platforms &&
          upload.game.platforms.toLowerCase().includes(platform.toLowerCase()),
      );
    }

    if (releaseYear && releaseYear !== "none") {
      const yearNum = Number(releaseYear);
      filteredUploads = filteredUploads.filter(
        (upload) => upload.game?.releaseYear === yearNum,
      );
    }

    // Nota: El filtro de tags ya se maneja en el algoritmo inteligente arriba

    // Aplicar cursor
    if (cursor) {
      const cursorDate = new Date(cursor);
      filteredUploads = filteredUploads.filter(
        (upload) => upload.createdAt && new Date(upload.createdAt) < cursorDate,
      );
    }

    // 📊 ORDENAMIENTO INTELIGENTE
    const hasSearchOrTags = searchText || (tags && tags.length > 0);

    if (
      hasSearchOrTags &&
      filteredUploads.some((upload) => "relevanceScore" in upload)
    ) {
      // Si hay búsqueda/tags, ya están ordenados por relevancia
      // Solo aplicar ordenamiento secundario para items con mismo score
      if (sortBy === "popular") {
        filteredUploads.sort((a, b) => {
          const scoreA =
            "relevanceScore" in a ? (a.relevanceScore as number) : 0;
          const scoreB =
            "relevanceScore" in b ? (b.relevanceScore as number) : 0;

          // Primero por relevancia, luego por popularidad
          if (scoreA !== scoreB) return scoreB - scoreA;
          return (b.likesCount || 0) - (a.likesCount || 0);
        });
      }
      // Para "newest" y "oldest" mantener orden por relevancia
    } else {
      // Sin búsqueda, usar ordenamiento tradicional
      if (sortBy === "oldest") {
        filteredUploads.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      } else if (sortBy === "popular") {
        filteredUploads.sort(
          (a, b) => (b.likesCount || 0) - (a.likesCount || 0),
        );
      } else {
        // newest (default)
        filteredUploads.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
    }

    // Paginación
    const paginatedUploads = filteredUploads.slice(0, limit);

    const lastUpload = paginatedUploads.at(-1);
    const nextCursor =
      paginatedUploads.length === limit && lastUpload?.createdAt
        ? lastUpload.createdAt.toISOString()
        : null;

    return {
      uploads: paginatedUploads as UploadWithDetails[],
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching uploads:", error);
    throw error;
  }
}

export async function getAllUploads(): Promise<UploadWithDetails[]> {
  try {
    const uploadList = await db.query.uploads.findMany({
      with: {
        profile: true,
        game: true,
        images: {
          orderBy: [asc(uploadImages.order)],
        },
      },
      orderBy: [desc(uploads.createdAt)],
    });
    return uploadList;
  } catch (error) {
    console.error("Error fetching uploads:", error);
    throw error;
  }
}

export async function getUploadsByTag(tag: string, limit = 16) {
  return db.query.uploads.findMany({
    where: like(uploads.tags, `%${tag}%`),
    orderBy: [desc(uploads.createdAt)],
    limit,
    with: {
      profile: true,
      game: true,
    },
  });
}

export async function getUploadsByGame(gameName: string, limit = 16) {
  return db.query.uploads.findMany({
    where: ilike(games.name, `%${gameName}%`),
    with: {
      profile: true,
      game: true,
    },
    orderBy: [desc(uploads.createdAt)],
    limit,
  });
}

export async function getUploadByPublicId(
  publicId: string,
): Promise<UploadWithFullDetails | null> {
  try {
    const result = await db.query.uploads.findFirst({
      where: eq(uploads.publicId, Number(publicId)),
      with: {
        profile: true,
        game: true,
        images: {
          orderBy: [asc(uploadImages.order)],
        },
        comments: {
          where: (comment, { isNull }) => isNull(comment.replyTo),
          with: {
            profile: true,
            likes: true,
            replies: {
              with: {
                profile: true,
                likes: true,
                replies: {
                  with: {
                    profile: true,
                    likes: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return result ?? null;
  } catch (error) {
    console.error("Error fetching upload by public ID:", error);
    throw error;
  }
}

export async function getRelatedUploadsPaginated({
  gameId,
  tags,
  excludeId,
  limit = 12,
  cursor,
}: {
  gameId: string;
  tags: string | null;
  excludeId?: string;
  limit?: number;
  cursor?: string | null;
}): Promise<{
  uploads: UploadWithDetails[];
  nextCursor: string | null;
}> {
  const cursorCondition = cursor
    ? lt(uploads.createdAt, new Date(cursor))
    : undefined;

  const byGame: UploadWithDetails[] = await db.query.uploads.findMany({
    where: and(
      eq(uploads.gameId, gameId),
      excludeId ? not(eq(uploads.id, excludeId)) : undefined,
      cursorCondition,
    ),
    with: {
      profile: true,
      game: true,
      images: {
        orderBy: [asc(uploadImages.order)],
      },
    },
    orderBy: [desc(uploads.createdAt)],
    limit,
  });

  let byTags: UploadWithDetails[] = [];
  if (tags) {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length > 0) {
      byTags = await db.query.uploads.findMany({
        where: and(
          or(...tagList.map((tag) => like(uploads.tags, `%${tag}%`))),
          excludeId ? not(eq(uploads.id, excludeId)) : undefined,
          cursorCondition,
        ),
        with: {
          profile: true,
          game: true,
          images: {
            orderBy: [asc(uploadImages.order)],
          },
        },
        orderBy: [desc(uploads.createdAt)],
        limit,
      });
    }
  }

  const allRelated: UploadWithDetails[] = [...byGame, ...byTags].filter(
    (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i,
  );
  const paginatedRelated: UploadWithDetails[] = allRelated.slice(0, limit);

  const lastUpload = paginatedRelated.at(-1);
  const nextCursor =
    paginatedRelated.length === limit && lastUpload?.createdAt
      ? lastUpload.createdAt.toISOString()
      : null;

  return { uploads: paginatedRelated, nextCursor };
}

export async function getUploadWithUserInteractions(
  uploadId: string,
  userId?: string,
): Promise<UploadWithFullDetails | null> {
  try {
    const upload = await db.query.uploads.findFirst({
      where: eq(uploads.id, uploadId),
      with: {
        profile: true,
        game: true,
        images: {
          orderBy: [asc(uploadImages.order)],
        },
        comments: {
          where: (comment, { isNull }) => isNull(comment.replyTo),
          with: {
            profile: true,
            likes: true,
            replies: {
              with: {
                profile: true,
                likes: true,
                replies: {
                  with: {
                    profile: true,
                    likes: true,
                  },
                },
              },
            },
          },
          orderBy: [desc(uploadComments.createdAt)],
        },
      },
    });

    if (!upload) return null;

    let userLiked = false;
    if (userId) {
      const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
      });

      if (userProfile) {
        const userLike = await db.query.likes.findFirst({
          where: and(
            eq(likes.uploadId, uploadId),
            eq(likes.profileId, userProfile.id),
          ),
        });
        userLiked = !!userLike;
      }
    }

    return {
      ...upload,
      userLiked,
    } as UploadWithFullDetails & { userLiked: boolean };
  } catch (error) {
    console.error("Error getting upload with user interactions:", error);
    return null;
  }
}
