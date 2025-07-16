"use server";

import { eq } from "drizzle-orm";

import { db } from "../db";
import { profiles, users } from "../schema";

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
    with: {
      profile: true,
    },
  });
}

// Crea usuario y perfil
export async function createUser({
  email,
  password,
  username,
  displayName,
  bio,
  provider,
  providerId,
}: {
  email: string;
  password: string;
  username: string;
  displayName: string;
  bio?: string;
  provider?: string;
  providerId?: string;
}) {
  const [user] = await db
    .insert(users)
    .values({
      email,
      password,
      provider: provider ?? null,
      providerId: providerId ?? null,
    })
    .returning();

  await db.insert(profiles).values({
    userId: user.id,
    username,
    displayName,
    bio: bio ?? null,
  });

  return user;
}

// Obtener usuario por ID (con perfil)
export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, id),
    with: {
      profile: true,
    },
  });
}

// Actualizar contraseña de usuario
export async function updateUserPassword(userId: string, newPassword: string) {
  await db
    .update(users)
    .set({ password: newPassword })
    .where(eq(users.id, userId));
  return true;
}

// Verificar si la nueva contraseña es igual a la actual
export async function verifySamePassword(userId: string, newPassword: string) {
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });
  if (!user) return false;
  return user.password === newPassword;
}

export async function getExistingEmail(email: string) {
  try {
    return db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
  } catch (error) {
    console.error("Error al obtener el correo existente:", error);
    throw error;
  }
}
