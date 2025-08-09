import "server-only";

import { cookies } from "next/headers";

import type {
  CollectionPreviewWithDetails,
  UserWithProfile,
} from "@/lib/types";

import { apiUrl } from "@/lib";

export async function fetchCollectionBySlug(
  username: string,
  slug: string,
): Promise<CollectionPreviewWithDetails | null> {
  try {
    const res = await fetch(
      `${apiUrl}/api/users/${username}/collections/${slug}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.collection as CollectionPreviewWithDetails;
  } catch (err) {
    console.error("fetchCollectionBySlug error:", err);
    return null;
  }
}

export async function getCurrentUserProfileId(): Promise<string | null> {
  try {
    const cookieHeader = (await cookies()).toString();
    const res = await fetch(`${apiUrl}/api/user`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = (await res.json()) as UserWithProfile | null;
    return user?.profile?.id ?? null;
  } catch (err) {
    console.error("getCurrentUserProfileId error:", err);
    return null;
  }
}

export function computeCollectionAccess(
  collection: CollectionPreviewWithDetails,
  currentProfileId: string | null,
) {
  // Defaults
  let canView = collection.visibility === "public";
  let canEdit = false;
  let isFollowing = false;

  if (!currentProfileId) {
    return { canView, canEdit, isFollowing };
  }

  // Owner has all permissions
  if (collection.profileId === currentProfileId) {
    return { canView: true, canEdit: true, isFollowing: false };
  }

  // Check explicit permissions (designer en lugar de edit)
  const permissionLevel = { view: 1, designer: 2, admin: 3 } as const;

  const explicit = collection.permissions?.find(
    (p) => p.profileId === currentProfileId,
  );

  if (explicit) {
    const level =
      permissionLevel[explicit.permission as keyof typeof permissionLevel] ?? 0;
    canView = level >= permissionLevel.view || canView;
    canEdit = level >= permissionLevel.designer;
  }

  // Following
  isFollowing =
    collection.followers?.some((f) => f.followerId === currentProfileId) ??
    false;

  return { canView, canEdit, isFollowing };
}

export async function getCollectionPageData(username: string, slug: string) {
  const collection = await fetchCollectionBySlug(username, slug);
  if (!collection)
    return {
      collection: null,
      canView: false,
      canEdit: false,
      isFollowing: false,
    };

  const profileId = await getCurrentUserProfileId();
  const { canView, canEdit, isFollowing } = computeCollectionAccess(
    collection,
    profileId,
  );

  return { collection, canView, canEdit, isFollowing };
}
