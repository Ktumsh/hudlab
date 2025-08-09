import ProfileCollections from "./_components/profile-collections";

import { getServerAuth, type AuthSession } from "@/lib/server-auth";

export default async function ProfileCollectionsPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  const session: AuthSession | null = await getServerAuth();
  const currentUsername = session?.user?.username;
  const isSelf = !!currentUsername && currentUsername === profile;

  return <ProfileCollections username={profile} isSelf={isSelf} />;
}
