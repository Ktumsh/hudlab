import "server-only";

import type { ProfileData } from "@/lib/types";

import { fetcher } from "@/lib";

export async function getProfile(username: string) {
  try {
    const profile = await fetcher<ProfileData>(
      `/api/users/${username}/profile`,
    );
    if (!profile) return null;
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
