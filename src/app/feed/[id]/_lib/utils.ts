import type { Comment, CommentWithRelations } from "@/lib/types";

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

export function flattenReplies(replies: Comment[]): Comment[] {
  const flattened: Comment[] = [];

  function processReplies(replyList: Comment[]) {
    replyList.forEach((reply) => {
      flattened.push(reply);
      if (reply.replies && reply.replies.length > 0) {
        processReplies(reply.replies);
      }
    });
  }

  processReplies(replies);
  return flattened;
}

export function countTotalReplies(replies: Comment[]): number {
  return flattenReplies(replies).length;
}

export function findReplyReference(
  reply: Comment,
  replies?: Comment[],
): Comment | null {
  if (!reply.replyTo || !replies) return null;
  const allReplies = flattenReplies(replies);
  return allReplies.find((r) => r.id === reply.replyTo) || null;
}
