import { apiUrl } from "@/lib";
import "server-only";

export async function getUploadByPublicId(publicId: string) {
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

export async function getLikeStatus(publicId: string, userId?: string) {
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
