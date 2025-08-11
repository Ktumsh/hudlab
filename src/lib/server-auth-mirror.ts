import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

interface AuthSessionMirror {
  user: {
    id: string;
    username: string;
  };
}

// Versión que usa cookie espejo para cross-domain (heurística, no para autorización real)
export const getServerAuthFromMirror = cache(
  async (): Promise<AuthSessionMirror | null> => {
    try {
      const cookieStore = await cookies();
      const mirrorCookie = cookieStore.get("hudlab_auth")?.value;

      if (!mirrorCookie) return null;

      // Parse format: uid:username:exp
      const parts = mirrorCookie.split(":");
      if (parts.length < 3) return null;

      const [uid, username, expStr] = parts;
      const exp = Number(expStr);

      if (!uid || !username || !exp || isNaN(exp) || Date.now() > exp) {
        return null;
      }

      return {
        user: {
          id: uid,
          username,
        },
      };
    } catch (error) {
      console.error("Error getting server auth from mirror:", error);
      return null;
    }
  },
);

export type { AuthSessionMirror };
