import { notFound } from "next/navigation";

import CollectionActions from "./_components/collection-actions";
import CollectionContent from "./_components/collection-content";
import CollectionHeader from "./_components/collection-header";

import {
  fetchCollectionBySlug,
  getCollectionPageData,
} from "@/data/collections";

interface CollectionPageProps {
  params: Promise<{ profile: string; slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { profile, slug } = await params;
  const collection = await fetchCollectionBySlug(profile, slug);
  if (!collection) return { title: "Colección no encontrada" };
  return {
    title: `${collection.name} - ${collection.profile.displayName || collection.profile.username}`,
    description:
      collection.description ||
      `Colección de HUDs de ${collection.profile.displayName || collection.profile.username}`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { profile, slug } = await params;
  const { collection, canView, canEdit, isFollowing } =
    await getCollectionPageData(profile, slug);
  if (!collection || !canView) notFound();
  return (
    <>
      <CollectionHeader collection={collection} />
      <CollectionActions
        collection={collection}
        canEdit={canEdit}
        isFollowing={isFollowing}
      />
      <CollectionContent collection={collection} canEdit={canEdit} />
    </>
  );
}
