"use client";

import { useParams, usePathname } from "next/navigation";

import ProfileHeader from "./profile-header";
import CollectionHeader from "../collections/collection-header";

import type { ProfileData } from "@/lib/types";

import { useCollection } from "@/hooks/profile/use-collection";

interface ProfileCollectionHeaderProps {
  username: string;
  initialData: ProfileData;
}

const ProfileCollectionHeader = ({
  username,
  initialData,
}: ProfileCollectionHeaderProps) => {
  const pathname = usePathname();
  const params = useParams();

  // Detectar si estamos en una página de colección
  const isCollectionPage = /^\/[^/]+\/collections\/[^/]+$/.test(pathname);

  // También detectar si estamos en /me/collections/[slug]
  const isMeCollectionPage = /^\/me\/collections\/[^/]+$/.test(pathname);

  // Si estamos en una página de colección, obtener los datos de la colección
  const slug = params?.slug as string;
  const { collection, isLoading: collectionLoading } = useCollection(
    isCollectionPage || isMeCollectionPage ? username : "",
    isCollectionPage || isMeCollectionPage ? slug : "",
  );

  // Si estamos en la página de colección y los datos están disponibles
  if (isCollectionPage || isMeCollectionPage) {
    return (
      <CollectionHeader collection={collection} isLoading={collectionLoading} />
    );
  }

  // Si no es página de colección, mostrar ProfileHeader normal
  return <ProfileHeader username={username} initialData={initialData} />;
};

export default ProfileCollectionHeader;
