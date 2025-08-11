import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { getServerAuthFromMirror } from "@/lib/server-auth-mirror";

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
  const session = await getServerAuthFromMirror();
  const username = session?.user?.username;
  if (username && username === profile) {
    redirect("/me/huds");
  }
  redirect(`/${profile}/huds`);
}
