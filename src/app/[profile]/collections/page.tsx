import { redirect } from "next/navigation";

import ProfileCollections from "./_components/profile-collections";

import { getServerAuthFromMirror } from "@/lib/server-auth-mirror";

export default async function ProfileCollectionsPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  const session = await getServerAuthFromMirror();
  const currentUsername = session?.user?.username;
  const isSelf = !!currentUsername && currentUsername === profile;
  if (isSelf) redirect("/me/collections");
  return <ProfileCollections username={profile} />;
}
