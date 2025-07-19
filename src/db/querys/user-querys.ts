"use server";

import { createAvatar } from "@dicebear/core";
import * as funEmojis from "@dicebear/fun-emoji";
import { eq, and } from "drizzle-orm";

import { generateHashedPassword } from "@/lib/utils";

import { db } from "../db";
import { profiles, users, userAccounts } from "../schema";

// Nota: `lastSessions` está importado pero no se usa actualmente.
// Se mantiene disponible para funcionalidades futuras como:
// - Panel de dispositivos activos del usuario
// - Auditoría de seguridad
// - Analytics de administración
// La funcionalidad actual de "última sesión" usa localStorage por seguridad.

export async function getUserByEmail(email: string) {
  try {
    return db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
      with: {
        profile: true,
        accounts: true,
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
  avatarUrl,
}: {
  email: string;
  password?: string; // Opcional para providers OAuth
  username: string;
  displayName: string;
  provider?: string;
  providerId?: string;
  avatarUrl?: string;
}) {
  // Validación: Para credentials se requiere contraseña
  if ((!provider || provider === "credentials") && !password) {
    throw new Error("Password is required for credentials-based registration");
  }

  // Solo hashear la contraseña si no es un provider OAuth
  const hashedPassword =
    provider && provider !== "credentials"
      ? null
      : password
        ? generateHashedPassword(password)
        : null;

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
      })
      .returning();

    await db.insert(profiles).values({
      userId: user.id,
      username,
      displayName,
      avatarUrl: avatarUrl ?? avatarSvg,
    });

    // Crear la cuenta asociada
    if (provider) {
      await db.insert(userAccounts).values({
        userId: user.id,
        provider,
        providerId,
        lastUsedAt: new Date(),
      });
    } else {
      // Para credentials
      await db.insert(userAccounts).values({
        userId: user.id,
        provider: "credentials",
        providerId: null,
        lastUsedAt: new Date(),
      });
    }

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
        accounts: true,
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

export async function addUserAccount(
  userId: string,
  provider: string,
  providerId: string,
) {
  try {
    await db.insert(userAccounts).values({
      userId,
      provider,
      providerId,
      lastUsedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error al agregar cuenta de usuario:", error);
    throw error;
  }
}

export async function updateLastUsedAccount(userId: string, provider: string) {
  try {
    await db
      .update(userAccounts)
      .set({ lastUsedAt: new Date() })
      .where(
        and(
          eq(userAccounts.userId, userId),
          eq(userAccounts.provider, provider),
        ),
      );
    return true;
  } catch (error) {
    console.error("Error al actualizar última cuenta usada:", error);
    throw error;
  }
}

export async function getUserAccounts(userId: string) {
  try {
    return await db.query.userAccounts.findMany({
      where: (ua, { eq }) => eq(ua.userId, userId),
    });
  } catch (error) {
    console.error("Error al obtener cuentas del usuario:", error);
    throw error;
  }
}

export async function hasUserAccount(userId: string, provider: string) {
  try {
    const account = await db.query.userAccounts.findFirst({
      where: (ua, { eq, and }) =>
        and(eq(ua.userId, userId), eq(ua.provider, provider)),
    });
    return !!account;
  } catch (error) {
    console.error("Error al verificar cuenta de usuario:", error);
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
