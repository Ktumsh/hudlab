import { redirect } from "next/navigation";

import CollectionContent from "@/components/collections/collection-content";
import { getServerAuth } from "@/lib/server-auth";

interface CollectionPageProps {
  params: Promise<{ profile: string; slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { profile: username, slug } = await params;

  const session = await getServerAuth();

  if (session?.user?.username === username) {
    redirect(`/me/collections/${slug}`);
  }

  return <CollectionContent username={username} slug={slug} />;
}
