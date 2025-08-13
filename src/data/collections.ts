import "server-only";

import type { CollectionPreviewWithDetails } from "@/lib/types";

import { apiUrl } from "@/lib";

export async function getCollectionData(
  username: string,
  slug: string,
): Promise<CollectionPreviewWithDetails | null> {
  try {
    const res = await fetch(
      `${apiUrl}/api/users/${username}/collections/${slug}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.collection;
  } catch (err) {
    console.error("fetchCollectionBySlug error:", err);
    return null;
  }
}
