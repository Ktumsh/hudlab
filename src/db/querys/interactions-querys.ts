"use server";

import { eq, and, desc, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import { auth } from "@/app/auth/auth";

import { db } from "../db";
import {
  likes,
  uploads,
  uploadComments,
  profiles,
  commentLikes,
} from "../schema";

// ❤️ LIKES ACTIONS
export async function toggleLike(uploadId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    // Buscar el perfil del usuario
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
    });

    if (!profile) {
      throw new Error("Perfil no encontrado");
    }

    // Verificar si ya existe el like
    const existingLike = await db.query.likes.findFirst({
      where: and(eq(likes.uploadId, uploadId), eq(likes.profileId, profile.id)),
    });

    let isLiked: boolean;

    if (existingLike) {
      // Quitar like
      await db
        .delete(likes)
        .where(
          and(eq(likes.uploadId, uploadId), eq(likes.profileId, profile.id)),
        );

      // Decrementar contador
      await db
        .update(uploads)
        .set({
          likesCount: sql`${uploads.likesCount} - 1`,
        })
        .where(eq(uploads.id, uploadId));

      isLiked = false;
    } else {
      // Agregar like
      await db.insert(likes).values({
        uploadId,
        profileId: profile.id,
      });

      // Incrementar contador
      await db
        .update(uploads)
        .set({
          likesCount: sql`${uploads.likesCount} + 1`,
        })
        .where(eq(uploads.id, uploadId));

      isLiked = true;
    }

    // Obtener el nuevo contador
    const updatedUpload = await db.query.uploads.findFirst({
      where: eq(uploads.id, uploadId),
      columns: { likesCount: true },
    });

    const newLikesCount = updatedUpload?.likesCount ?? 0;

    // Revalidar cache
    revalidateTag(`upload-${uploadId}`);
    revalidateTag("uploads");

    return {
      success: true,
      isLiked,
      likesCount: newLikesCount,
    };
  } catch (error) {
    console.error("Error toggling like:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getLikeStatus(uploadId: string, userId?: string) {
  try {
    if (!userId) {
      return { isLiked: false };
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    if (!profile) {
      return { isLiked: false };
    }

    const like = await db.query.likes.findFirst({
      where: and(eq(likes.uploadId, uploadId), eq(likes.profileId, profile.id)),
    });

    return { isLiked: !!like };
  } catch (error) {
    console.error("Error getting like status:", error);
    return { isLiked: false };
  }
}

// 💬 COMMENTS ACTIONS
export async function addComment(uploadId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    if (!content.trim()) {
      throw new Error("El comentario no puede estar vacío");
    }

    // Buscar el perfil del usuario
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
    });

    if (!profile) {
      throw new Error("Perfil no encontrado");
    }

    // Agregar comentario
    const [newComment] = await db
      .insert(uploadComments)
      .values({
        uploadId,
        profileId: profile.id,
        content: content.trim(),
      })
      .returning();

    // Incrementar contador de comentarios
    await db
      .update(uploads)
      .set({
        commentsCount: sql`${uploads.commentsCount} + 1`,
      })
      .where(eq(uploads.id, uploadId));

    // Obtener el comentario con datos del perfil
    const commentWithProfile = await db.query.uploadComments.findFirst({
      where: eq(uploadComments.id, newComment.id),
      with: {
        profile: true,
      },
    });

    // Revalidar cache
    revalidateTag(`upload-${uploadId}`);
    revalidateTag("uploads");

    return {
      success: true,
      comment: commentWithProfile,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// Añadir respuesta a un comentario
export async function addReply(commentId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    if (!content.trim()) {
      throw new Error("La respuesta no puede estar vacía");
    }

    // Buscar el perfil del usuario
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
    });

    if (!profile) {
      throw new Error("Perfil no encontrado");
    }

    // Buscar el comentario padre para obtener el uploadId
    const parentComment = await db.query.uploadComments.findFirst({
      where: eq(uploadComments.id, commentId),
    });

    if (!parentComment) {
      throw new Error("Comentario padre no encontrado");
    }

    // Agregar respuesta
    const [newReply] = await db
      .insert(uploadComments)
      .values({
        uploadId: parentComment.uploadId,
        profileId: profile.id,
        content: content.trim(),
        replyTo: commentId,
      })
      .returning();

    // Incrementar contador de comentarios del upload
    await db
      .update(uploads)
      .set({
        commentsCount: sql`${uploads.commentsCount} + 1`,
      })
      .where(eq(uploads.id, parentComment.uploadId));

    // Obtener la respuesta con datos del perfil
    const replyWithProfile = await db.query.uploadComments.findFirst({
      where: eq(uploadComments.id, newReply.id),
      with: {
        profile: true,
      },
    });

    // Revalidar cache
    revalidateTag(`upload-${parentComment.uploadId}`);
    revalidateTag("uploads");

    return {
      success: true,
      reply: replyWithProfile,
      uploadId: parentComment.uploadId,
    };
  } catch (error) {
    console.error("Error adding reply:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// Toggle like en comentario
export async function toggleCommentLike(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    // Buscar el perfil del usuario
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
    });

    if (!profile) {
      throw new Error("Perfil no encontrado");
    }

    // Verificar si ya existe el like
    const existingLike = await db.query.commentLikes.findFirst({
      where: and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.profileId, profile.id),
      ),
    });

    let isLiked: boolean;

    if (existingLike) {
      // Quitar like
      await db
        .delete(commentLikes)
        .where(
          and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.profileId, profile.id),
          ),
        );
      isLiked = false;
    } else {
      // Agregar like
      await db.insert(commentLikes).values({
        commentId,
        profileId: profile.id,
      });
      isLiked = true;
    }

    // Obtener el comentario para saber el uploadId y revalidar cache
    const comment = await db.query.uploadComments.findFirst({
      where: eq(uploadComments.id, commentId),
    });

    if (comment) {
      revalidateTag(`upload-${comment.uploadId}`);
      revalidateTag("uploads");
    }

    return {
      success: true,
      isLiked,
    };
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getComments(uploadId: string, limit = 50) {
  try {
    const comments = await db.query.uploadComments.findMany({
      where: eq(uploadComments.uploadId, uploadId),
      with: {
        profile: true,
      },
      orderBy: [desc(uploadComments.createdAt)],
      limit,
    });

    return {
      success: true,
      comments,
    };
  } catch (error) {
    console.error("Error getting comments:", error);
    return {
      success: false,
      comments: [],
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    // Buscar el comentario con el perfil del autor
    const comment = await db.query.uploadComments.findFirst({
      where: eq(uploadComments.id, commentId),
      with: {
        profile: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comentario no encontrado");
    }

    // Verificar que el usuario sea el autor del comentario
    if (comment.profile.user.id !== session.user.id) {
      throw new Error("No tienes permisos para eliminar este comentario");
    }

    // Función recursiva para contar todas las respuestas que se eliminarán
    const countAllReplies = async (parentId: string): Promise<number> => {
      const directReplies = await db.query.uploadComments.findMany({
        where: eq(uploadComments.replyTo, parentId),
        columns: { id: true },
      });

      let totalReplies = directReplies.length;

      for (const reply of directReplies) {
        const nestedRepliesCount = await countAllReplies(reply.id);
        totalReplies += nestedRepliesCount;
      }

      return totalReplies;
    };

    const totalRepliesToDelete = await countAllReplies(commentId);
    const totalCommentsToDelete = 1 + totalRepliesToDelete; // +1 por el comentario principal

    // Eliminar solo el comentario principal (CASCADE eliminará las respuestas automáticamente)
    await db.delete(uploadComments).where(eq(uploadComments.id, commentId));

    // Decrementar contador de comentarios
    await db
      .update(uploads)
      .set({
        commentsCount: sql`${uploads.commentsCount} - ${totalCommentsToDelete}`,
      })
      .where(eq(uploads.id, comment.uploadId));

    // Revalidar cache
    revalidateTag(`upload-${comment.uploadId}`);
    revalidateTag("uploads");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function updateComment(commentId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    if (!content.trim()) {
      throw new Error("El comentario no puede estar vacío");
    }

    // Buscar el comentario con el perfil del autor
    const comment = await db.query.uploadComments.findFirst({
      where: eq(uploadComments.id, commentId),
      with: {
        profile: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comentario no encontrado");
    }

    // Verificar que el usuario sea el autor del comentario
    if (comment.profile.user.id !== session.user.id) {
      throw new Error("No tienes permisos para editar este comentario");
    }

    // Actualizar comentario
    await db
      .update(uploadComments)
      .set({ content: content.trim() })
      .where(eq(uploadComments.id, commentId));

    // Revalidar cache
    revalidateTag(`upload-${comment.uploadId}`);
    revalidateTag("uploads");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
