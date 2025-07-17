"use server";

import { createAvatar } from "@dicebear/core";
import * as funEmojis from "@dicebear/fun-emoji";
import { eq } from "drizzle-orm";

import { generateHashedPassword } from "@/lib";

import { db } from "../db";
import { profiles, users } from "../schema";

export async function getUserByEmail(email: string) {
  try {
    return db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
      with: {
        profile: true,
      },
    });
  } catch (error) {
    console.error("Error al obtener el usuario por correo:", error);
    throw error;
  }
}

export async function createUser({
  email,
  password,
  username,
  displayName,
  provider,
  providerId,
}: {
  email: string;
  password: string;
  username: string;
  displayName: string;
  provider?: string;
  providerId?: string;
}) {
  const hashedPassword = generateHashedPassword(password);

  const avatar = createAvatar(funEmojis, {
    seed: displayName,
    backgroundType: ["gradientLinear", "solid"],
  });

  const avatarSvg = avatar.toDataUri();

  try {
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        provider: provider ?? null,
        providerId: providerId ?? null,
      })
      .returning();

    await db.insert(profiles).values({
      userId: user.id,
      username,
      displayName,
      avatarUrl: avatarSvg,
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function getUserById(id: string) {
  try {
    return await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, id),
      with: {
        profile: true,
      },
    });
  } catch (error) {
    console.error("Error al obtener el usuario por ID:", error);
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  try {
    return await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.username, username),
      with: {
        user: true,
      },
    });
  } catch (error) {
    console.error("Error al obtener el usuario por nombre de usuario:", error);
    throw error;
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("Error al actualizar la contraseña del usuario:", error);
    throw error;
  }
}

export async function verifySamePassword(userId: string, newPassword: string) {
  try {
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });
    if (!user) return false;
    return user.password === newPassword;
  } catch (error) {
    console.error("Error al verificar la contraseña del usuario:", error);
    throw error;
  }
}

export async function getExistingEmail(email: string): Promise<boolean> {
  try {
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    return !!existing;
  } catch (error) {
    console.error("Error al obtener el correo existente:", error);
    throw error;
  }
}

export async function getExistingUsernamesStartingWith(
  base: string,
): Promise<string[]> {
  try {
    const usernames = await db.query.profiles.findMany({
      where: (p, { ilike }) => ilike(p.username, `${base}%`),
      columns: { username: true },
    });
    return usernames.map((u) => u.username);
  } catch (error) {
    console.error("Error al obtener los nombres de usuario existentes:", error);
    throw error;
  }
}
