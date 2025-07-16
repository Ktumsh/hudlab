import { GAME_GENRE_MAP } from "@/lib/consts";

import type { Comment, CommentWithRelations } from "@/lib/types";

export function getTranslatedGenres(genres: string): string[] {
  if (!genres) return [];
  return genres.split(",").map((g) => {
    const genre = g.trim();
    return GAME_GENRE_MAP[genre] || genre;
  });
}

export function mapComment(
  comment: CommentWithRelations,
  currentUserId?: string,
): Comment {
  return {
    id: comment.id,
    user: {
      id: comment.profile?.id ?? "",
      displayName:
        comment.profile?.displayName || comment.profile?.username || "",
      avatarUrl: comment.profile?.avatarUrl ?? undefined,
    },
    content: comment.content,
    createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(0),
    likes: Array.isArray(comment.likes) ? comment.likes.length : 0,
    liked: Array.isArray(comment.likes)
      ? !!currentUserId &&
        comment.likes.some((l: any) => l.profileId === currentUserId)
      : false,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map((r: any) => mapComment(r, currentUserId))
      : [],
    replyTo: comment.replyTo ?? undefined,
  };
}
