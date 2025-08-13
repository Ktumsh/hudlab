import { notFound, redirect } from "next/navigation";

import CollectionContent from "@/components/collections/collection-content";
import { getCollectionData } from "@/data/collections";
import { getServerAuth } from "@/lib/server-auth";

interface MeCollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MeCollectionPage({
  params,
}: MeCollectionPageProps) {
  const { slug } = await params;

  const session = await getServerAuth();

  if (!session?.user?.username) {
    notFound();
  }

  const username = session.user.username;
  const collection = await getCollectionData(username, slug);

  if (!collection) {
    notFound();
  }

  // Si no es el owner, redirigir a la página del perfil del owner
  if (collection.profile.username !== username) {
    redirect(`/${collection.profile.username}/collections/${slug}`);
  }

  return <CollectionContent username={username} slug={slug} />;
}
