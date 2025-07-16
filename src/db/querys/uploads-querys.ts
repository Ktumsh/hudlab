"use server";

import { desc, ilike, like, eq, lt, and, asc, or, not } from "drizzle-orm";

import {
  FilterState,
  UploadWithDetails,
  UploadWithFullDetails,
} from "@/lib/types";

import { db } from "../db";
import { games, profiles, uploads } from "../schema";

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

    const whereConditions = [];

    if (cursor) {
      whereConditions.push(lt(uploads.createdAt, new Date(cursor)));
    }

    if (searchText) {
      const text = `%${searchText}%`;
      whereConditions.push(
        or(
          ilike(uploads.title, text),
          ilike(uploads.description, text),
          ilike(uploads.tags, text),
          ilike(games.name, text),
          ilike(games.platforms, text),
        ),
      );
    }

    if (platform) {
      whereConditions.push(ilike(games.platforms, `%${platform}%`));
    }

    if (releaseYear) {
      whereConditions.push(eq(games.releaseYear, Number(releaseYear)));
    }

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        whereConditions.push(ilike(uploads.tags, `%${tag}%`));
      }
    }

    const whereClause = whereConditions.length
      ? and(...whereConditions)
      : undefined;

    let orderByClause;
    if (sortBy === "oldest") {
      orderByClause = [asc(uploads.createdAt)];
    } else if (sortBy === "popular") {
      orderByClause = [desc(uploads.likesCount)];
    } else {
      orderByClause = [desc(uploads.createdAt)];
    }

    const uploadList = await db
      .select({
        id: uploads.id,
        publicId: uploads.publicId,
        title: uploads.title,
        description: uploads.description,
        imageUrl: uploads.imageUrl,
        type: uploads.type,
        tags: uploads.tags,
        createdAt: uploads.createdAt,
        profileId: uploads.profileId,
        likesCount: uploads.likesCount,
        commentsCount: uploads.commentsCount,
        profile: {
          id: profiles.id,
          createdAt: profiles.createdAt,
          userId: profiles.userId,
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          bio: profiles.bio || null,
        },
        game: {
          id: games.id,
          name: games.name,
          platforms: games.platforms,
          releaseYear: games.releaseYear,
          developer: games.developer,
          publisher: games.publisher,
          coverUrl: games.coverUrl,
        },
      })
      .from(uploads)
      .leftJoin(profiles, eq(uploads.profileId, profiles.id))
      .leftJoin(games, eq(uploads.gameId, games.id))
      .where(whereClause)
      .orderBy(...orderByClause)
      .limit(limit);

    const lastUpload = uploadList.at(-1);
    const nextCursor =
      uploadList.length === limit && lastUpload?.createdAt
        ? lastUpload.createdAt.toISOString()
        : null;

    return {
      uploads: uploadList as UploadWithDetails[],
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
    with: { profile: true, game: true },
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
        with: { profile: true, game: true },
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
