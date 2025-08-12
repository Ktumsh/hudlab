import { redirect } from "next/navigation";

import ProfileUploads from "@/components/profile/profile-uploads";
import { getServerAuthFromMirror } from "@/lib/server-auth-mirror";

export const dynamic = "force-dynamic";

export default async function MeHudsPage() {
  const session = await getServerAuthFromMirror();
  const username = session?.user?.username;
  if (!username) redirect("/auth/login?next=/me/huds");
  return <ProfileUploads username={username} />;
}
