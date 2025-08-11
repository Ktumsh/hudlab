import { redirect } from "next/navigation";

import ProfileHeaderClient from "@/app/[profile]/_components/profile-header";
import ProfileTabs from "@/app/[profile]/_components/profile-tabs";
import { getProfile } from "@/data/profile";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ profile: string }>;
}) {
  const { profile: username } = await params;

  const data = await getProfile(username);
  if (!data) redirect("/feed");

  const profile = data.profile;
  const stats = data.stats;
  const isFollowing = !!data.isFollowing;

  return (
    <main>
      <ProfileHeaderClient
        username={username}
        initialData={{ profile, stats, isFollowing }}
      />
      <div className="relative px-1 md:px-6">
        <ProfileTabs username={username} />
        {children}
      </div>
    </main>
  );
}
