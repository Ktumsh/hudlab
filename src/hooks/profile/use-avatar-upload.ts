"use client";

import { toast } from "sonner";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import { apiUpload } from "@/lib/fetcher";

interface AvatarUploadResponse {
  success: boolean;
  error?: string;
  avatarUrl?: string;
}

export function useAvatarUpload(username: string) {
  const profileKey = `/api/users/${username}/profile`;
  const userKey = "/api/user";

  const mutation = useSWRMutation(
    "/api/profile/avatar",
    (_url, { arg }: { arg: FormData }) =>
      apiUpload<AvatarUploadResponse>("/api/profile/avatar", arg),
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Avatar cambiado correctamente");
          mutate(profileKey);
          mutate(userKey);
        } else {
          toast.error(data.error || "No se pudo cambiar el avatar");
        }
      },
      onError: (error) => {
        console.error("Avatar upload error:", error);
        toast.error("No se pudo cambiar el avatar");
      },
    },
  );

  return mutation;
}
