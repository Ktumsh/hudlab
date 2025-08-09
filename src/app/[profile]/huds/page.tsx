import ProfileUploads from "./profile-uploads";

export default async function ProfileHudsPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  return <ProfileUploads username={profile} />;
}
