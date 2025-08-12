import { redirect } from "next/navigation";

import ProfileCollections from "@/components/profile/profile-collections";
import { getServerAuthFromMirror } from "@/lib/server-auth-mirror";

export const dynamic = "force-dynamic";

export default async function MeCollectionsPage() {
  const session = await getServerAuthFromMirror();
  const username = session?.user?.username;
  if (!username) redirect("/auth/login?next=/me/collections");
  return <ProfileCollections username={username} />;
}
