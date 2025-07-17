import { redirect } from "next/navigation";

import type { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ profile: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { profile } = await params;
  return {
    title: `@${profile}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { profile } = await params;

  if (!profile) redirect("/feed");

  return <div>ProfilePage: {profile}</div>;
}
