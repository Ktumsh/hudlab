import { redirect } from "next/navigation";

import { auth } from "@/app/auth/auth";
import { getLikeStatus } from "@/db/querys/interactions-querys";
import { getUploadByPublicId } from "@/db/querys/uploads-querys";

import UploadDetails from "./_components/upload-details";

import type { Metadata } from "next";

interface UploadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  props: UploadPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
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

  // Obtener estado de like del usuario actual
  const session = await auth();
  const likeStatus = session?.user?.id
    ? await getLikeStatus(upload.id, session.user.id)
    : { isLiked: false };

  return <UploadDetails upload={upload} initialLiked={likeStatus.isLiked} />;
}
