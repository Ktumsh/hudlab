import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { apiUrl } from "./consts";

import type { UserWithProfile } from "@/lib/types";

interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    username?: string;
  };
}

export type { AuthSession };

export const getServerAuth = cache(async (): Promise<AuthSession | null> => {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${apiUrl}/api/user`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const user: UserWithProfile = data;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.displayName || user.profile?.username,
        image: user.profile?.avatarUrl,
        username: user.profile?.username,
      },
    };
  } catch (error) {
    console.error("Error getting server auth:", error);
    return null;
  }
});
