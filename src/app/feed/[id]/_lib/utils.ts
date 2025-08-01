import type { Comment, CommentWithRelations } from "@/lib/types";

export function mapComment(
  comment: CommentWithRelations,
  currentUserId?: string,
): Comment {
  // Aplastar todas las replies al mismo nivel
  const flattenAllReplies = (
    replies: CommentWithRelations[],
  ): CommentWithRelations[] => {
    const flattened: CommentWithRelations[] = [];

    const processReplies = (replyList: CommentWithRelations[]) => {
      replyList.forEach((reply) => {
        flattened.push(reply);
        if (reply.replies && reply.replies.length > 0) {
          processReplies(reply.replies);
        }
      });
    };

    processReplies(replies);
    return flattened;
  };

  const allReplies = Array.isArray(comment.replies)
    ? flattenAllReplies(comment.replies)
    : [];

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
        comment.likes.some((l) => l.profileId === currentUserId)
      : false,
    replies: allReplies.map((r) => ({
      id: r.id,
      user: {
        id: r.profile?.id ?? "",
        displayName: r.profile?.displayName || r.profile?.username || "",
        avatarUrl: r.profile?.avatarUrl ?? undefined,
      },
      content: r.content,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(0),
      likes: Array.isArray(r.likes) ? r.likes.length : 0,
      liked: Array.isArray(r.likes)
        ? !!currentUserId && r.likes.some((l) => l.profileId === currentUserId)
        : false,
      replies: [], // Las replies no tienen sub-replies en la estructura final
      replyTo: r.replyTo ?? undefined,
    })),
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
