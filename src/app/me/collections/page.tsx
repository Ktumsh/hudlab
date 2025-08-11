import { redirect } from "next/navigation";

import ProfileCollections from "@/app/[profile]/collections/_components/profile-collections";
import { getServerAuth } from "@/lib/server-auth";

export default async function MeCollectionsPage() {
  const session = await getServerAuth();
  const username = session?.user?.username;
  if (!username) redirect("/auth/login?next=/me/collections");
  return <ProfileCollections username={username} />;
}
