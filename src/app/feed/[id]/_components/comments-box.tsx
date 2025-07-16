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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib";

import CommentField from "./comment-field";
import CommentItem from "./comment-item";
import RepliesToggleButton from "./replies-toggle-button";

import type { Comment } from "@/lib/types";
import type { Emoji } from "frimousse";

interface CommentsBoxProps {
  commentCount: number;
  comments: Comment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommentsBox = ({
  commentCount,
  comments: initialComments,
  open,
  onOpenChange,
}: CommentsBoxProps) => {
  const isMobile = useIsMobile();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [expanded, setExpanded] = useState(isMobile);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerOpenMap, setEmojiPickerOpenMap] = useState<{
    [key: string]: boolean;
  }>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyContentMap, setReplyContentMap] = useState<{
    [key: string]: string;
  }>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  useEffect(() => {
    if (isMobile) {
      setExpanded(true);
      return;
    }
  }, [isMobile]);

  const sortedComments = [
    ...comments.filter((c) => c.user.id === "me"),
    ...comments
      .filter((c) => c.user.id !== "me")
      .sort((a, b) => b.likes - a.likes),
  ];

  const handleLike = (id: string) => {
    setComments((comments) =>
      comments.map((c) =>
        c.id === id
          ? {
              ...c,
              likes: c.liked ? c.likes - 1 : c.likes + 1,
              liked: !c.liked,
            }
          : c,
      ),
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Math.random().toString(36),
        user: {
          id: "me",
          displayName: "Tú",
          avatarUrl: undefined,
        },
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        liked: false,
        replies: [],
      },
      ...comments,
    ]);
    setNewComment("");
  };

  const handleAddReply = (parentId: string) => {
    const replyContent = replyContentMap[parentId] || "";
    if (!replyContent.trim()) return;

    setComments((prev) =>
      prev.map((c) => {
        const isTarget =
          c.id === parentId ||
          (c.replies &&
            c.replies.some(
              (r) =>
                r.id === parentId ||
                (r.replies && r.replies.some((sub) => sub.id === parentId)),
            ));

        if (isTarget) {
          return {
            ...c,
            replies: [
              ...c.replies!,
              {
                id: Math.random().toString(36),
                user: {
                  id: "me",
                  displayName: "Tú",
                  avatarUrl: undefined,
                },
                content: replyContent,
                createdAt: new Date(),
                likes: 0,
                liked: false,
                replies: [],
                replyTo: parentId,
              },
            ],
          };
        }
        return c;
      }),
    );
    setReplyContentMap((prev) => ({ ...prev, [parentId]: "" }));
    setReplyingId(null);
  };

  const handleCancelReply = () => {
    setReplyingId(null);
    setReplyContentMap((prev) => ({ ...prev, [replyingId!]: "" }));
  };

  // Estado para controlar respuestas expandidas por comentario
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCommentEmoji = (emoji: Emoji) => {
    const symbol = emoji.emoji || "";
    setNewComment((prev) => prev + symbol);
    replyTextareaRef.current?.focus();
    setShowEmojiPicker(false);
  };

  const handleReplyEmoji = (id: string) => (emoji: Emoji) => {
    const symbol = emoji.emoji || "";
    setReplyContentMap((prev) => ({
      ...prev,
      [id]: (prev[id] || "") + symbol,
    }));
    replyTextareaRef.current?.focus();
    setEmojiPickerOpenMap((prev) => ({ ...prev, [id]: false }));
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    function editRecursive(list: Comment[]): Comment[] {
      return list.map((c) =>
        c.id === editingId
          ? { ...c, content: editingContent }
          : {
              ...c,
              replies: c.replies ? editRecursive(c.replies) : [],
            },
      );
    }
    setComments((prev) => editRecursive(prev));
    setEditingId(null);
    setEditingContent("");
  };

  const handleDelete = (id: string) => {
    function deleteRecursive(list: Comment[]): Comment[] {
      return list
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          replies: c.replies ? deleteRecursive(c.replies) : [],
        }));
    }
    setComments((prev) => deleteRecursive(prev));
  };

  function renderReplyReference(reply: Comment, replies?: Comment[]) {
    if (!reply.replyTo || !replies) return null;
    const allReplies = replies.flatMap((r) => [r, ...(r.replies ?? [])]);
    const ref = allReplies.find((r) => r.id === reply.replyTo);
    return ref ? (
      <span className="text-info-content cursor-pointer font-semibold hover:underline">
        {ref.user.displayName}
      </span>
    ) : null;
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
            initial={{ opacity: 0, height: 36 }}
            animate={{ opacity: 1, height: expanded ? "auto" : 36 }}
            exit={{ opacity: 0, height: 36 }}
            transition={{ duration: 0.2 }}
            className={cn(
              expanded && "mb-4 overflow-y-auto p-4 md:max-h-[600px] md:p-2",
            )}
          >
            {sortedComments.map((comment, idx) => {
              if (!expanded && idx > 0) return null;
              const isOwn = comment.user.id === "me";
              return (
                <CommentItem
                  key={comment.id}
                  user={comment.user}
                  content={comment.content}
                  createdAt={comment.createdAt}
                  likes={comment.likes}
                  liked={comment.liked}
                  isOwn={isOwn}
                  expanded={expanded}
                  onLike={() => handleLike(comment.id)}
                  onReply={() => setReplyingId(comment.id)}
                  onEdit={() => handleEdit(comment.id, comment.content)}
                  onDelete={() => handleDelete(comment.id)}
                >
                  {replyingId === comment.id && (
                    <CommentField
                      ref={replyTextareaRef}
                      value={replyContentMap[comment.id] || ""}
                      onChange={(e) =>
                        setReplyContentMap((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                      onEmoji={handleReplyEmoji(comment.id)}
                      emojiOpen={!!emojiPickerOpenMap[comment.id]}
                      setEmojiOpen={(open) =>
                        setEmojiPickerOpenMap((prev) => ({
                          ...prev,
                          [comment.id]: open,
                        }))
                      }
                      onCancel={handleCancelReply}
                      onSave={() => handleAddReply(comment.id)}
                    />
                  )}
                  {editingId === comment.id && (
                    <CommentField
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onEmoji={handleReplyEmoji(comment.id)}
                      emojiOpen={!!emojiPickerOpenMap[comment.id]}
                      setEmojiOpen={(open) =>
                        setEmojiPickerOpenMap((prev) => ({
                          ...prev,
                          [comment.id]: open,
                        }))
                      }
                      onCancel={() => setEditingId(null)}
                      onSave={handleSaveEdit}
                      actionButtonText="Guardar"
                      placeholder="Editar comentario..."
                    />
                  )}
                  {comment.replies &&
                    comment.replies.length > 0 &&
                    (expanded || idx > 0) && (
                      <div className="mt-1 md:ml-1 md:border-l md:pl-3">
                        {comment.replies.length > 1 && (
                          <RepliesToggleButton
                            expanded={!!expandedReplies[comment.id]}
                            count={comment.replies.length}
                            onClick={() => toggleReplies(comment.id)}
                          />
                        )}
                        {(!expandedReplies[comment.id]
                          ? comment.replies.slice(0, 1)
                          : comment.replies
                        ).map((reply) => {
                          const isOwnReply = reply.user.id === "me";
                          return (
                            <CommentItem
                              key={reply.id}
                              user={reply.user}
                              content={reply.content}
                              createdAt={reply.createdAt}
                              likes={reply.likes}
                              liked={reply.liked}
                              isOwn={isOwnReply}
                              expanded={expanded}
                              onLike={() => handleLike(reply.id)}
                              replyReference={renderReplyReference(
                                reply,
                                comment.replies,
                              )}
                              onReply={() => setReplyingId(reply.id)}
                              onEdit={() => handleEdit(reply.id, reply.content)}
                              onDelete={() => handleDelete(reply.id)}
                            >
                              {replyingId === reply.id && (
                                <CommentField
                                  ref={replyTextareaRef}
                                  value={replyContentMap[reply.id] || ""}
                                  onChange={(e) =>
                                    setReplyContentMap((prev) => ({
                                      ...prev,
                                      [reply.id]: e.target.value,
                                    }))
                                  }
                                  onEmoji={handleReplyEmoji(reply.id)}
                                  emojiOpen={!!emojiPickerOpenMap[reply.id]}
                                  setEmojiOpen={(open) =>
                                    setEmojiPickerOpenMap((prev) => ({
                                      ...prev,
                                      [reply.id]: open,
                                    }))
                                  }
                                  onCancel={handleCancelReply}
                                  onSave={() => handleAddReply(reply.id)}
                                />
                              )}
                              {editingId === reply.id && (
                                <CommentField
                                  value={editingContent}
                                  onChange={(e) =>
                                    setEditingContent(e.target.value)
                                  }
                                  onEmoji={handleReplyEmoji(reply.id)}
                                  emojiOpen={!!emojiPickerOpenMap[reply.id]}
                                  setEmojiOpen={(open) =>
                                    setEmojiPickerOpenMap((prev) => ({
                                      ...prev,
                                      [reply.id]: open,
                                    }))
                                  }
                                  onCancel={() => setEditingId(null)}
                                  onSave={handleSaveEdit}
                                  actionButtonText="Guardar"
                                  placeholder="Editar respuesta..."
                                />
                              )}
                            </CommentItem>
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
    <div className="relative">
      <Textarea
        rows={1}
        placeholder="Agregar un comentario"
        className="min-h-12 border-0 py-2.5 pr-20"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <EmojiPicker
          open={showEmojiPicker}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={(emoji) => {
            handleCommentEmoji(emoji);
          }}
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
            onClick={() => handleAddComment()}
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
