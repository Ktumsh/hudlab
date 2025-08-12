import { redirect } from "next/navigation";

import ProfileUploads from "../../../components/profile/profile-uploads";

import { getServerAuthFromMirror } from "@/lib/server-auth-mirror";

export const dynamic = "force-dynamic";

export default async function ProfileHudsPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  const session = await getServerAuthFromMirror();
  const username = session?.user?.username;
  if (username && username === profile) redirect("/me/huds");
  return <ProfileUploads username={profile} />;
}
