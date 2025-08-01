import "server-only";

import { cache } from "react";

import type { UserWithProfile } from "@/lib/types";

import { apiUrl } from "@/lib";
import { getServerAuth } from "@/lib/server-auth";

export const getCurrentUser = cache(
  async (): Promise<UserWithProfile | null> => {
    const session = await getServerAuth();

    if (!session?.user?.id) return null;

    try {
      const response = await fetch(`${apiUrl}/api/user/${session.user.id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  },
);
