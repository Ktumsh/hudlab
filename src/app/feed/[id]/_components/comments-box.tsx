"use client";

import {
  IconChevronDown,
  IconChevronUp,
  IconMessage,
  IconMoodSmile,
  IconSend2,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";

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
import { useInteractions } from "@/hooks/use-interactions";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib";

import CommentField from "./comment-field";
import CommentItem from "./comment-item";
import RepliesToggleButton from "./replies-toggle-button";
import { countTotalReplies, flattenReplies } from "../_lib/utils";

import type { Comment, UploadWithFullDetails } from "@/lib/types";

interface CommentsBoxProps {
  upload: UploadWithFullDetails;
  commentCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onCommentsCountChange?: (change: number) => void;
}

const CommentsBox = ({
  upload,
  commentCount,
  open,
  onOpenChange,
  isLoading = false,
  onCommentsCountChange,
}: CommentsBoxProps) => {
  const isMobile = useIsMobile();

  // Hooks para manejar comentarios y likes
  const {
    comments,
    setComments,
    currentUserProfileId,
    handleDeleteComment,
    handleUpdateComment,
    isUpdating,
  } = useComments({ upload });

  const { handleToggleCommentLike } = useCommentLikes({
    // NO pasamos setComments para evitar reordenamientos inmediatos
    onCommentsUpdate: undefined,
  });

  const {
    handleAddComment: addComment,
    handleAddReply: addReply,
    isCommentLoading,
  } = useInteractions({
    uploadId: upload.id,
    initialLiked: false,
    initialLikesCount: 0,
    initialCommentsCount: commentCount,
  });

  const [expanded, setExpanded] = useState(isMobile);
  const [newComment, setNewComment] = useState("");

  // Custom hooks para organizar la lógica
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

  // Calcular el orden inicial de comentarios solo una vez o cuando cambian los comentarios base
  const [sortedComments, setSortedComments] = useState<Comment[]>([]);
  // Referencia para trackear la estructura de comentarios (IDs)
  const lastCommentsStructure = useRef<string>("");
  // Estado para manejar likes optimistas SIN afectar el orden
  const [optimisticLikes, setOptimisticLikes] = useState<{
    [commentId: string]: { liked: boolean; likes: number };
  }>({});

  useEffect(() => {
    // Crear signature de la estructura actual (solo IDs y replies, NO likes)
    const createStructureSignature = (commentsList: Comment[]): string => {
      return JSON.stringify(
        commentsList.map((c) => ({
          id: c.id,
          replyTo: c.replyTo,
          replies: c.replies
            ? c.replies.map((r) => ({ id: r.id, replyTo: r.replyTo }))
            : [],
        })),
      );
    };

    const currentStructure = createStructureSignature(comments);
    const structureChanged = currentStructure !== lastCommentsStructure.current;

    // Solo recalcular si la estructura cambió (agregar/eliminar comentarios)
    if (comments.length === 0 || structureChanged) {
      const sorted = [
        // Primero: comentarios propios ordenados por fecha (más recientes primero)
        ...comments
          .filter((c) =>
            currentUserProfileId ? c.user.id === currentUserProfileId : false,
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        // Segundo: otros comentarios ordenados por popularidad (likes)
        ...comments
          .filter((c) =>
            currentUserProfileId ? c.user.id !== currentUserProfileId : true,
          )
          .sort((a, b) => b.likes - a.likes),
      ];

      setSortedComments(sorted);
      lastCommentsStructure.current = currentStructure;
      // Limpiar likes optimistas cuando cambian los comentarios base
      setOptimisticLikes({});
    }
  }, [comments, currentUserProfileId]);

  // Efecto separado para limpiar comentarios temporales duplicados
  const cleanTemporaryComments = useCallback(() => {
    const hasTemporaryComments = comments.some((c) => c.id.startsWith("temp-"));
    const hasRealComments = comments.some((c) => !c.id.startsWith("temp-"));

    // Solo ejecutar limpieza si tenemos tanto temporales como reales
    if (!hasTemporaryComments || !hasRealComments) return;

    const cleanComments = comments.filter((c) => {
      // Si es temporal, verificar si ya existe una versión real
      if (c.id.startsWith("temp-")) {
        // Buscar si existe un comentario real con contenido similar y mismo usuario
        const hasRealVersion = comments.some(
          (realComment) =>
            !realComment.id.startsWith("temp-") &&
            realComment.content.trim() === c.content.trim() &&
            realComment.user.id === c.user.id &&
            Math.abs(
              new Date(realComment.createdAt).getTime() -
                new Date(c.createdAt).getTime(),
            ) < 10000, // 10 segundos
        );
        return !hasRealVersion;
      }
      return true;
    });

    // Solo actualizar si realmente hay comentarios para limpiar
    if (cleanComments.length !== comments.length) {
      setComments(cleanComments);
    }
  }, [comments, setComments]);

  useEffect(() => {
    cleanTemporaryComments();
  }, [cleanTemporaryComments]);

  const handleLike = async (id: string) => {
    // Implementar likes optimistas localmente sin afectar el orden
    const comment = findCommentById(displayComments, id);
    if (!comment) return;

    const currentLiked = optimisticLikes[id]?.liked ?? comment.liked;
    const currentLikes = optimisticLikes[id]?.likes ?? comment.likes;

    // Actualización optimista local
    setOptimisticLikes((prev) => ({
      ...prev,
      [id]: {
        liked: !currentLiked,
        likes: currentLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
      },
    }));

    // Llamar al servidor
    if (handleToggleCommentLike) {
      const result = await handleToggleCommentLike(id);
      if (!result.success) {
        // Revertir si falló
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

  // Función auxiliar para encontrar un comentario por ID recursivamente
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

  // Función para aplicar likes optimistas a los comentarios sin cambiar el orden
  const applyOptimisticLikes = (commentsList: Comment[]): Comment[] => {
    return commentsList.map((comment) => {
      const optimistic = optimisticLikes[comment.id];
      const updatedComment = optimistic
        ? { ...comment, liked: optimistic.liked, likes: optimistic.likes }
        : comment;

      // Aplicar recursivamente a las replies
      const updatedReplies = comment.replies
        ? applyOptimisticLikes(comment.replies)
        : comment.replies;

      return { ...updatedComment, replies: updatedReplies };
    });
  };

  // Comentarios con likes optimistas aplicados, manteniendo el orden original
  const displayComments = applyOptimisticLikes(sortedComments);

  const handleAddComment = async () => {
    if (!newComment.trim() || !addComment) return;

    // Estado optimista: agregar el comentario inmediatamente
    const tempComment: Comment = {
      id: `temp-${Date.now()}`, // ID temporal
      content: newComment,
      createdAt: new Date(),
      likes: 0,
      liked: false,
      replyTo: undefined,
      user: {
        id: currentUserProfileId || "",
        displayName: "Tú",
        username: "",
        avatarUrl: undefined,
      },
      replies: [],
    };

    setComments((prev) => [tempComment, ...prev]);
    const originalComment = newComment;
    setNewComment("");

    const result = await addComment(originalComment);
    if (result.success) {
      // ✅ MEJOR: No eliminar el temporal inmediatamente
      // El useComments se actualizará con los datos del servidor automáticamente
      // y eso disparará el useEffect que recalculará el orden

      // Notificar el cambio en el contador (+1 comentario)
      onCommentsCountChange?.(1);
    } else {
      // Revertir el estado optimista solo si falló
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setNewComment(originalComment); // Restaurar el texto
    }
  };

  const handleAddReply = async (parentId: string) => {
    const replyContent = getReplyContent(parentId);
    if (!replyContent.trim() || !addReply) return;

    // Estado optimista: agregar la reply inmediatamente
    const tempReply: Comment = {
      id: `temp-reply-${Date.now()}`,
      content: replyContent,
      createdAt: new Date(),
      likes: 0,
      liked: false,
      replyTo: parentId,
      user: {
        id: currentUserProfileId || "",
        displayName: "Tú",
        username: "",
        avatarUrl: undefined,
      },
      replies: [],
    };

    // Función para agregar reply optimistamente de forma recursiva
    function addReplyRecursive(list: Comment[]): Comment[] {
      return list.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), tempReply] }
          : {
              ...c,
              replies: c.replies ? addReplyRecursive(c.replies) : [],
            },
      );
    }

    setComments((prev) => addReplyRecursive(prev));
    clearReplyContent(parentId);
    cancelReply();

    const result = await addReply(parentId, replyContent);
    if (!result.success) {
      // Revertir el estado optimista si falló
      function removeReplyRecursive(list: Comment[]): Comment[] {
        return list.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: (c.replies || []).filter((r) => r.id !== tempReply.id),
              }
            : {
                ...c,
                replies: c.replies ? removeReplyRecursive(c.replies) : [],
              },
        );
      }
      setComments((prev) => removeReplyRecursive(prev));
      // Restaurar el contenido de la reply
      setReplyContent(parentId, replyContent);
      startReply(parentId);
    } else {
      // Notificar el cambio en el contador (+1 comentario por la reply)
      onCommentsCountChange?.(1);
    }
  };

  const handleCancelReply = () => {
    cancelReply();
  };

  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveEdit = async () => {
    if (!handleUpdateComment) {
      // Fallback local para desarrollo
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
      cancelEdit();
      return;
    }

    if (!editingId || !editingContent.trim()) return;

    const result = await handleUpdateComment(editingId, editingContent);
    if (result.success) {
      // Actualizar localmente también para UI optimista
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
      cancelEdit();
    }
  };

  const handleDelete = async (id: string) => {
    // Función para contar todos los comentarios/replies que se eliminarán (including nested)
    const countCommentsToDelete = (
      comments: Comment[],
      targetId: string,
    ): number => {
      for (const comment of comments) {
        if (comment.id === targetId) {
          // Contar el comentario principal + todas sus replies recursivamente
          return 1 + (comment.replies ? countTotalReplies(comment.replies) : 0);
        }
        if (comment.replies) {
          const count = countCommentsToDelete(comment.replies, targetId);
          if (count > 0) return count;
        }
      }
      return 0;
    };

    const deleteCount = countCommentsToDelete(comments, id);

    if (!handleDeleteComment) {
      // Fallback local para desarrollo
      function deleteRecursive(list: Comment[]): Comment[] {
        return list
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: c.replies ? deleteRecursive(c.replies) : [],
          }));
      }
      setComments((prev) => deleteRecursive(prev));
      onCommentsCountChange?.(-deleteCount);
      return;
    }

    const result = await handleDeleteComment(id);
    if (result.success) {
      // Actualizar localmente también para UI optimista
      function deleteRecursive(list: Comment[]): Comment[] {
        return list
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: c.replies ? deleteRecursive(c.replies) : [],
          }));
      }
      setComments((prev) => deleteRecursive(prev));
      // Notificar el cambio en el contador (número negativo)
      onCommentsCountChange?.(-deleteCount);
    }
  };

  // Función para encontrar una reply por referencia
  function renderReplyReference(reply: Comment, replies?: Comment[]) {
    if (!reply.replyTo || !replies) return null;
    const allReplies = flattenReplies(replies);
    const ref = allReplies.find((r) => r.id === reply.replyTo);
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
                      onSave={() => handleAddReply(comment.id)}
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
                        {countTotalReplies(comment.replies) > 1 && (
                          <RepliesToggleButton
                            expanded={isRepliesExpanded(comment.id)}
                            count={countTotalReplies(comment.replies)}
                            onClick={() => toggleReplies(comment.id)}
                          />
                        )}
                        {(isRepliesExpanded(comment.id)
                          ? flattenReplies(comment.replies)
                          : countTotalReplies(comment.replies) === 1
                            ? flattenReplies(comment.replies).slice(0, 1) // Si solo hay 1 reply, mostrarla siempre
                            : !hasBeenExpanded(comment.id)
                              ? flattenReplies(comment.replies).slice(0, 1) // Estado inicial: mostrar primera reply
                              : []
                        ) // Ya fue expandido y ahora colapsado: no mostrar ninguna
                          .map((reply: Comment) => {
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
                              <CommentItem
                                key={reply.id}
                                user={displayReplyUser}
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
                                    onSave={() => handleAddReply(reply.id)}
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
            onClick={() => handleAddComment()}
            disabled={isLoading}
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
