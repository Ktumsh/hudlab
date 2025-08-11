import { redirect } from "next/navigation";

import ProfileUploads from "./profile-uploads";

import { getServerAuth } from "@/lib/server-auth";

export default async function ProfileHudsPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  const session = await getServerAuth();
  const username = session?.user?.username;
  if (username && username === profile) redirect("/me/huds");
  return <ProfileUploads username={profile} />;
}
