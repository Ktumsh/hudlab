import { randomUUID } from "crypto";

import { eq } from "drizzle-orm";

import { db } from "../db";
import { users, profiles } from "../schema";

async function createDemoUser() {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.username, "demo"),
  });

  if (existing) {
    console.log("✅ Ya existe el usuario demo.");
    return;
  }

  const userId = randomUUID();

  await db.insert(users).values({
    id: userId,
    email: "demo@hudlab.app",
    password: null,
    provider: "local",
    providerId: null,
    role: "user",
  });

  await db.insert(profiles).values({
    userId,
    username: "demo",
    displayName: "HUDLab Demo",
    avatarUrl: null,
    bio: "Perfil de demostración para pruebas internas.",
  });

  console.log("🎉 Usuario demo creado correctamente.");
}

createDemoUser();
