import { redirect } from "next/navigation";

import ProfileUploads from "@/app/[profile]/huds/profile-uploads";
import { getServerAuth } from "@/lib/server-auth";

export default async function MeHudsPage() {
  const session = await getServerAuth();
  const username = session?.user?.username;
  if (!username) redirect("/auth/login?next=/me/huds");
  return <ProfileUploads username={username} />;
}
