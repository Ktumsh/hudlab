import { redirect } from "next/navigation";

import UploadDetails from "./_components/upload-details";

import type { Metadata } from "next";

import { getLikeStatus, getUploadByPublicId } from "@/data/upload";
import { getServerAuth } from "@/lib/server-auth";

interface UploadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: UploadPageProps): Promise<Metadata> {
  const { id } = await params;
  const upload = await getUploadByPublicId(id);
  return {
    title: upload?.title ?? "HUD compartido",
  };
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { id } = await params;

  if (!id) redirect("/feed");

  const upload = await getUploadByPublicId(id);

  if (!upload) redirect("/feed");

  const session = await getServerAuth();

  const likeStatus = session?.user?.id
    ? await getLikeStatus(String(upload.publicId), session.user.id)
    : { isLiked: false };

  return <UploadDetails upload={upload} initialLiked={likeStatus.isLiked} />;
}
