import { redirect } from "next/navigation";

import ProfileHeader from "@/components/profile/profile-header";
import ProfileTabs from "@/components/profile/profile-tabs";
import { getProfile } from "@/data/profile";
import { getServerAuthFromMirror } from "@/lib/server-auth-mirror";

export const dynamic = "force-dynamic";

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthFromMirror();
  const username = session?.user?.username;
  if (!username) redirect("/auth/login?next=/me/huds");

  const data = await getProfile(username);
  if (!data) redirect("/feed");

  const profile = data.profile;
  const stats = data.stats;
  const isFollowing = false;

  return (
    <main>
      <ProfileHeader
        username={username}
        initialData={{ profile, stats, isFollowing }}
      />
      <div className="relative mb-24 px-1 md:mb-32 md:px-6">
        <ProfileTabs username={username} basePath="/me" />
        {children}
      </div>
    </main>
  );
}
