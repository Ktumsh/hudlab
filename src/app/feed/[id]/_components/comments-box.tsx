"use client";

import {
  IconChevronDown,
  IconChevronUp,
  IconMessage,
  IconMoodSmile,
  IconSend2,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect } from "react";

import CommentField from "./comment-field";
import CommentItem from "./comment-item";
import CommentSkeleton from "./comment-skeleton";
import RepliesToggleButton from "./replies-toggle-button";

import type { Comment } from "@/lib/types";

import { useCommentEditing } from "@/app/feed/[id]/_hooks/use-comment-editing";
import { useCommentLikes } from "@/app/feed/[id]/_hooks/use-comment-likes";
import { useCommentReplies } from "@/app/feed/[id]/_hooks/use-comment-replies";
import { useComments } from "@/app/feed/[id]/_hooks/use-comments";
import { useEmojiPicker } from "@/app/feed/[id]/_hooks/use-emoji-picker";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib";

interface CommentsBoxProps {
  commentCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentsCountChange?: (change: number) => void;
  uploadId: string;
  publicId: string;
}

const CommentsBox = ({
  commentCount,
  open,
  onOpenChange,
  onCommentsCountChange,
  uploadId,
  publicId,
}: CommentsBoxProps) => {
  const isMobile = useIsMobile();

  const {
    comments,
    currentUserProfileId,
    mutate: refetchComments,
    handleAddComment,
    handleAddReply,
    handleDeleteComment,
    handleUpdateComment,
    isLoading,
    isUpdating,
    isCommentLoading,
    deletingCommentIds,
  } = useComments({ publicId, uploadId, onCommentsCountChange });

  const { handleToggleCommentLike } = useCommentLikes({
    onCommentsUpdate: undefined,
  });

  const [expanded, setExpanded] = useState(isMobile);
  const [newComment, setNewComment] = useState("");

  const [postingComment, setPostingComment] = useState<string | null>(null);
  const [postingReplies, setPostingReplies] = useState<{
    [parentId: string]: string;
  }>({});

  const {
    editingId,
    editingContent,
    setEditingContent,
    startEdit,
    cancelEdit,
  } = useCommentEditing();

  const {
    replyingId,
    setReplyContent,
    getReplyContent,
    clearReplyContent,
    toggleReplies,
    isRepliesExpanded,
    hasBeenExpanded,
    startReply,
    cancelReply,
  } = useCommentReplies();

  const {
    showEmojiPicker,
    setShowEmojiPicker,
    setEmojiPickerOpen,
    isEmojiPickerOpen,
    handleCommentEmoji,
    handleReplyEmoji,
    handleEditEmoji,
  } = useEmojiPicker();

  useEffect(() => {
    if (isMobile) {
      setExpanded(true);
      return;
    }
  }, [isMobile]);

  const [optimisticLikes, setOptimisticLikes] = useState<{
    [commentId: string]: { liked: boolean; likes: number };
  }>({});

  const findCommentById = (
    commentsList: Comment[],
    id: string,
  ): Comment | null => {
    for (const comment of commentsList) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const applyOptimisticLikes = (commentsList: Comment[]): Comment[] => {
    return commentsList.map((comment) => {
      const optimistic = optimisticLikes[comment.id];
      const updatedComment = optimistic
        ? { ...comment, liked: optimistic.liked, likes: optimistic.likes }
        : comment;

      const updatedReplies = comment.replies
        ? applyOptimisticLikes(comment.replies)
        : comment.replies;

      return { ...updatedComment, replies: updatedReplies };
    });
  };

  const displayComments = applyOptimisticLikes(comments);

  const handleLike = async (id: string) => {
    const comment = findCommentById(displayComments, id);
    if (!comment) return;

    const currentLiked = optimisticLikes[id]?.liked ?? comment.liked;
    const currentLikes = optimisticLikes[id]?.likes ?? comment.likes;

    setOptimisticLikes((prev) => ({
      ...prev,
      [id]: {
        liked: !currentLiked,
        likes: currentLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
      },
    }));

    if (handleToggleCommentLike) {
      const result = await handleToggleCommentLike(id);
      if (!result.success) {
        setOptimisticLikes((prev) => ({
          ...prev,
          [id]: {
            liked: currentLiked,
            likes: currentLikes,
          },
        }));
      }
    }
  };

  const handleNewComment = async () => {
    if (!newComment.trim()) return;

    const originalComment = newComment;

    setPostingComment(originalComment);
    setNewComment("");

    const result = await handleAddComment(originalComment);
    if (result.success) {
      refetchComments();
    } else {
      setNewComment(originalComment);
    }

    setPostingComment(null);
  };

  const handleNewReply = async (parentId: string) => {
    const replyContent = getReplyContent(parentId);
    if (!replyContent.trim()) return;

    setPostingReplies((prev) => ({ ...prev, [parentId]: replyContent }));

    clearReplyContent(parentId);
    cancelReply();

    const result = await handleAddReply(parentId, replyContent);
    if (result.success) {
      refetchComments();
    } else {
      setReplyContent(parentId, replyContent);
      startReply(parentId);
    }

    setPostingReplies((prev) => {
      const updated = { ...prev };
      delete updated[parentId];
      return updated;
    });
  };

  const handleCancelReply = () => {
    cancelReply();
  };

  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveEdit = async () => {
    if (!editingId || !editingContent.trim()) return;

    const result = await handleUpdateComment(editingId, editingContent);
    if (result.success) {
      cancelEdit();
    }
  };

  const handleDelete = async (id: string) => {
    const countCommentsToDelete = (
      comments: Comment[],
      targetId: string,
    ): number => {
      for (const comment of comments) {
        if (comment.id === targetId) {
          return 1 + (comment.replies ? comment.replies.length : 0);
        }
        if (comment.replies) {
          const count = countCommentsToDelete(comment.replies, targetId);
          if (count > 0) return count;
        }
      }
      return 0;
    };

    const deleteCount = countCommentsToDelete(comments, id);

    const result = await handleDeleteComment(id);

    if (result.success) {
      onCommentsCountChange?.(-deleteCount);
    }
  };

  function renderReplyReference(reply: Comment, replies?: Comment[]) {
    if (!reply.replyTo || !replies) return null;

    // Buscar la referencia en las replies del comentario actual
    const ref = replies.find((r) => r.id === reply.replyTo);

    if (!ref) return null;

    const isOwnReference = currentUserProfileId
      ? ref.user.id === currentUserProfileId
      : false;

    return (
      <span className="text-info-content cursor-pointer font-semibold hover:underline">
        {isOwnReference ? "Tú" : ref.user.displayName}
      </span>
    );
  }

  const content = (
    <>
      <div className="mb-2 hidden items-center justify-between md:flex">
        <span className="text-base-content font-semibold">
          {commentCount > 0
            ? `${commentCount} comentarios`
            : "Aún no hay comentarios"}
        </span>
        {commentCount > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((e) => !e)}
            aria-label={
              expanded ? "Ocultar comentarios" : "Ver todos los comentarios"
            }
          >
            {expanded ? <IconChevronUp /> : <IconChevronDown />}
          </Button>
        )}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {commentCount > 0 && (
          <motion.div
            key={expanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0, height: 56 }}
            animate={{ opacity: 1, height: expanded ? "auto" : 56 }}
            exit={{ opacity: 0, height: 56 }}
            transition={{ duration: 0.2 }}
            className={cn(
              expanded && "mb-4 overflow-y-auto p-4 md:max-h-[600px] md:p-2",
            )}
          >
            {postingComment && <CommentSkeleton content={postingComment} />}

            {displayComments.map((comment, idx) => {
              if (!expanded && idx > 0) return null;
              const isOwn = currentUserProfileId
                ? comment.user.id === currentUserProfileId
                : false;

              // Mostrar "Tú" si es el comentario del usuario actual
              const displayUser = {
                ...comment.user,
                displayName: isOwn ? "Tú" : comment.user.displayName,
              };

              return (
                <CommentItem
                  key={comment.id}
                  user={displayUser}
                  content={comment.content}
                  createdAt={comment.createdAt}
                  likes={comment.likes}
                  liked={comment.liked}
                  isOwn={isOwn}
                  expanded={expanded}
                  isDeleting={deletingCommentIds.includes(comment.id)}
                  onLike={() => handleLike(comment.id)}
                  onReply={() => startReply(comment.id)}
                  onEdit={() => startEdit(comment.id, comment.content)}
                  onDelete={() => handleDelete(comment.id)}
                >
                  {replyingId === comment.id && (
                    <CommentField
                      ref={replyTextareaRef}
                      value={getReplyContent(comment.id)}
                      onChange={(e) =>
                        setReplyContent(comment.id, e.target.value)
                      }
                      onEmoji={handleReplyEmoji(
                        comment.id,
                        setReplyContent,
                        getReplyContent,
                      )}
                      emojiOpen={isEmojiPickerOpen(comment.id)}
                      setEmojiOpen={(open) =>
                        setEmojiPickerOpen(comment.id, open)
                      }
                      onCancel={handleCancelReply}
                      onSave={() => handleNewReply(comment.id)}
                      isLoading={isCommentLoading}
                    />
                  )}
                  {editingId === comment.id && (
                    <CommentField
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onEmoji={handleEditEmoji(
                        (prevOrValue) =>
                          typeof prevOrValue === "function"
                            ? setEditingContent(prevOrValue(editingContent))
                            : setEditingContent(prevOrValue),
                        editingId,
                      )}
                      emojiOpen={isEmojiPickerOpen(comment.id)}
                      setEmojiOpen={(open) =>
                        setEmojiPickerOpen(comment.id, open)
                      }
                      onCancel={() => cancelEdit()}
                      onSave={handleSaveEdit}
                      actionButtonText="Guardar"
                      placeholder="Editar comentario..."
                      isLoading={isUpdating}
                    />
                  )}
                  {comment.replies &&
                    comment.replies.length > 0 &&
                    (expanded || idx > 0) && (
                      <div className="mt-1 md:ml-1">
                        {(comment.replies || []).length > 1 && (
                          <RepliesToggleButton
                            expanded={isRepliesExpanded(comment.id)}
                            count={(comment.replies || []).length}
                            onClick={() => toggleReplies(comment.id)}
                          />
                        )}

                        {postingReplies[comment.id] && (
                          <CommentSkeleton
                            content={postingReplies[comment.id]}
                          />
                        )}

                        {(isRepliesExpanded(comment.id)
                          ? comment.replies || []
                          : (comment.replies || []).length === 1
                            ? comment.replies.slice(0, 1)
                            : !hasBeenExpanded(comment.id)
                              ? (comment.replies || []).slice(0, 1)
                              : []
                        ).map((reply: Comment) => {
                          const isOwnReply = currentUserProfileId
                            ? reply.user.id === currentUserProfileId
                            : false;

                          const displayReplyUser = {
                            ...reply.user,
                            displayName: isOwnReply
                              ? "Tú"
                              : reply.user.displayName,
                          };

                          return (
                            <div key={reply.id}>
                              <CommentItem
                                user={displayReplyUser}
                                content={reply.content}
                                createdAt={reply.createdAt}
                                likes={reply.likes}
                                liked={reply.liked}
                                isOwn={isOwnReply}
                                expanded={expanded}
                                isDeleting={deletingCommentIds.includes(
                                  reply.id,
                                )}
                                onLike={() => handleLike(reply.id)}
                                replyReference={renderReplyReference(
                                  reply,
                                  comment.replies,
                                )}
                                onReply={() => startReply(reply.id)}
                                onEdit={() =>
                                  startEdit(reply.id, reply.content)
                                }
                                onDelete={() => handleDelete(reply.id)}
                              >
                                {replyingId === reply.id && (
                                  <CommentField
                                    ref={replyTextareaRef}
                                    value={getReplyContent(reply.id)}
                                    onChange={(e) =>
                                      setReplyContent(reply.id, e.target.value)
                                    }
                                    onEmoji={handleReplyEmoji(
                                      reply.id,
                                      setReplyContent,
                                      getReplyContent,
                                    )}
                                    emojiOpen={isEmojiPickerOpen(reply.id)}
                                    setEmojiOpen={(open) =>
                                      setEmojiPickerOpen(reply.id, open)
                                    }
                                    onCancel={handleCancelReply}
                                    onSave={() => handleNewReply(reply.id)}
                                    isLoading={isCommentLoading}
                                  />
                                )}
                                {editingId === reply.id && (
                                  <CommentField
                                    value={editingContent}
                                    onChange={(e) =>
                                      setEditingContent(e.target.value)
                                    }
                                    onEmoji={handleEditEmoji(
                                      (prevOrValue) =>
                                        typeof prevOrValue === "function"
                                          ? setEditingContent(
                                              prevOrValue(editingContent),
                                            )
                                          : setEditingContent(prevOrValue),
                                      editingId,
                                    )}
                                    emojiOpen={isEmojiPickerOpen(reply.id)}
                                    setEmojiOpen={(open) =>
                                      setEmojiPickerOpen(reply.id, open)
                                    }
                                    onCancel={() => cancelEdit()}
                                    onSave={handleSaveEdit}
                                    actionButtonText="Guardar"
                                    placeholder="Editar respuesta..."
                                    isLoading={isUpdating}
                                  />
                                )}
                              </CommentItem>

                              {postingReplies[reply.id] && (
                                <CommentSkeleton
                                  content={postingReplies[reply.id]}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </CommentItem>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const footer = (
    <div className="relative flex gap-2">
      <UserAvatar className="mt-2" />
      <div className="flex-1">
        <Textarea
          rows={1}
          placeholder="Agregar un comentario"
          className="input-neutral input-ghost bg-base-200 focus-visible:bg-base-300! min-h-12 border-0 py-2.5 pr-20 focus:ring-0! md:text-base"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={postingComment !== null}
        />
        {postingComment && (
          <p className="text-base-content/60 mt-1 text-xs">
            Publicando comentario...
          </p>
        )}
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <EmojiPicker
          open={showEmojiPicker}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={handleCommentEmoji(setNewComment)}
        >
          <Button
            size="icon"
            variant="ghost"
            className="hidden border-0 md:flex"
          >
            <IconMoodSmile className="size-7" />
          </Button>
        </EmojiPicker>
        {newComment.length > 0 && (
          <Button
            size="icon"
            variant="primary"
            onClick={() => handleNewComment()}
            disabled={isLoading || postingComment !== null}
          >
            <IconSend2 />
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-full">
          <DrawerHeader>
            <DrawerTitle>Comentarios</DrawerTitle>
            <DrawerDescription className="sr-only">
              Comparte tus pensamientos sobre este HUD.
            </DrawerDescription>
          </DrawerHeader>
          <div
            className={cn("overflow-y-auto", commentCount === 0 && "mt-auto")}
          >
            {commentCount === 0 && (
              <div className="text-content-muted flex flex-col gap-4 px-6 text-center">
                <IconMessage className="mx-auto size-16" />
                <p>
                  !Todavía no hay comentarios! Sé el primero en compartir tu
                  opinión.
                </p>
              </div>
            )}
            {content}
          </div>
          <DrawerFooter className="p-3">{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <>
      {content}
      {footer}
    </>
  );
};

export default CommentsBox;
