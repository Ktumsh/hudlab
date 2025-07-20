"use server";

import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "../db";
import { type EmailSend, emailSends } from "../schema";

export type EmailSendsActionType =
  | "email_verification"
  | "reset_password"
  | "email_change";

export async function getVerificationCode(
  code: string,
  actionType: EmailSendsActionType,
): Promise<Array<EmailSend>> {
  try {
    return db.query.emailSends.findMany({
      where: (e, { eq, and }) =>
        and(eq(e.code, code), eq(e.actionType, actionType)),
    });
  } catch (error) {
    console.error("Error al obtener el código de verificación:", error);
    throw error;
  }
}

export async function deleteVerificationCode(
  code: string,
  actionType: EmailSendsActionType,
): Promise<void> {
  try {
    await db
      .delete(emailSends)
      .where(
        and(eq(emailSends.code, code), eq(emailSends.actionType, actionType)),
      );
  } catch (error) {
    console.error("Error al eliminar el code de verificación:", error);
    throw error;
  }
}

// Insertar un nuevo registro de emailSends
export async function insertEmailSendsCode(
  userId: string,
  code: string,
  actionType: string,
): Promise<string> {
  const expiresAt = new Date();
  // Para reset de contraseña, dar 15 minutos; para otros, 10 minutos
  const minutesToAdd = actionType === "reset_password" ? 15 : 10;
  expiresAt.setMinutes(expiresAt.getMinutes() + minutesToAdd);
  const token = nanoid(64);

  try {
    await db
      .delete(emailSends)
      .where(
        and(
          eq(emailSends.userId, userId),
          eq(emailSends.actionType, actionType),
        ),
      );

    const [record] = await db
      .insert(emailSends)
      .values({
        userId,
        code,
        token,
        actionType,
        expiresAt,
      })
      .returning({ token: emailSends.token });

    return record.token;
  } catch (error) {
    console.error("Error al insertar el código de envío de correo:", error);
    throw error;
  }
}

export async function updateEmailSends(
  userId: string,
  actionType: EmailSendsActionType,
): Promise<EmailSend | undefined> {
  try {
    const result = await db
      .update(emailSends)
      .set({ verifiedAt: new Date() })
      .where(
        and(
          eq(emailSends.userId, userId),
          eq(emailSends.actionType, actionType),
          isNull(emailSends.verifiedAt),
        ),
      )
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error al marcar el correo como verificado:", error);
    throw error;
  }
}

// Verificar token de reseteo de contraseña
export async function verifyResetToken(token: string) {
  try {
    return db.query.emailSends.findFirst({
      where: (e, { eq }) => eq(e.token, token),
    });
  } catch (error) {
    console.error("Error al verificar el token de reseteo:", error);
    throw error;
  }
}
