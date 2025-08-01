import { redirect } from "next/navigation";

import UploadDetails from "./_components/upload-details";

import type { Metadata } from "next";

import { apiUrl } from "@/lib";
import { getServerAuth } from "@/lib/server-auth";

async function getUploadByPublicId(publicId: string) {
  try {
    const response = await fetch(`${apiUrl}/api/uploads/${publicId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.upload;
  } catch (error) {
    console.error("Error fetching upload:", error);
    return null;
  }
}

async function getLikeStatus(publicId: string, userId?: string) {
  if (!userId) return { isLiked: false, likesCount: 0 };

  try {
    const response = await fetch(
      `${apiUrl}/api/uploads/${publicId}/like-status`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return { isLiked: false, likesCount: 0 };
    }

    const data = await response.json();
    return data.likeStatus;
  } catch (error) {
    console.error("Error fetching like status:", error);
    return { isLiked: false, likesCount: 0 };
  }
}

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
    ? await getLikeStatus(upload.publicId, session.user.id)
    : { isLiked: false };

  return <UploadDetails upload={upload} initialLiked={likeStatus.isLiked} />;
}
