import { notFound } from "next/navigation";

import CollectionActions from "./_components/collection-actions";
import CollectionContent from "./_components/collection-content";
import CollectionHeader from "./_components/collection-header";

import { apiUrl } from "@/lib";
import { getServerAuth } from "@/lib/server-auth";

async function getCollectionBySlug(username: string, slug: string) {
  try {
    const response = await fetch(
      `${apiUrl}/api/users/${username}/collections/${slug}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.collection;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}

async function checkCollectionPermission(
  collectionId: string,
  profileId: string,
  permission: "view" | "edit",
) {
  try {
    const response = await fetch(
      `${apiUrl}/api/collections/${collectionId}/permissions/${profileId}?permission=${permission}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasPermission;
  } catch (error) {
    console.error("Error checking collection permission:", error);
    return false;
  }
}

async function getUserByUsername(userId: string) {
  try {
    const response = await fetch(`${apiUrl}/api/user/${userId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

interface CollectionPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { username, slug } = await params;
  const session = await getServerAuth();

  // Obtener la colección
  const collection = await getCollectionBySlug(username, slug);

  if (!collection) {
    notFound();
  }

  // Verificar permisos de acceso
  let canView = false;
  let canEdit = false;

  if (session?.user?.id) {
    const userProfile = await getUserByUsername(session.user.id);
    const profileId = userProfile?.id;

    if (profileId) {
      canView = await checkCollectionPermission(
        collection.id,
        profileId,
        "view",
      );
      canEdit = await checkCollectionPermission(
        collection.id,
        profileId,
        "edit",
      );
    }
  } else {
    // Usuario no autenticado solo puede ver colecciones públicas
    canView = collection.visibility === "public";
  }

  if (!canView) {
    notFound();
  }

  // Determinar si el usuario está siguiendo la colección
  let isFollowing = false;
  if (session?.user?.id) {
    const userProfile = await getUserByUsername(session.user.id);
    if (userProfile) {
      isFollowing = collection.followers.some(
        (follow: { followerId: string }) =>
          follow.followerId === userProfile.id,
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header de la colección */}
      <CollectionHeader collection={collection} />

      {/* Acciones (seguir, editar, etc.) */}
      {session?.user && (
        <CollectionActions
          collection={collection}
          canEdit={canEdit}
          isFollowing={isFollowing}
        />
      )}

      {/* Contenido de la colección */}
      <CollectionContent collection={collection} canEdit={canEdit} />
    </div>
  );
}

// Generar metadata dinámicamente
export async function generateMetadata({ params }: CollectionPageProps) {
  const { username, slug } = await params;
  const collection = await getCollectionBySlug(username, slug);

  if (!collection) {
    return {
      title: "Colección no encontrada",
    };
  }

  return {
    title: `${collection.name} - ${collection.profile.displayName || collection.profile.username}`,
    description:
      collection.description ||
      `Colección de uploads de ${collection.profile.displayName || collection.profile.username}`,
  };
}
