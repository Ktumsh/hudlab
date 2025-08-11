import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { getServerAuth } from "@/lib/server-auth";

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
  const session = await getServerAuth();
  const username = session?.user?.username;
  if (username && username === profile) {
    redirect("/me/huds");
  }
  redirect(`/${profile}/huds`);
}
