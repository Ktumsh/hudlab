"use client";

import { toast } from "sonner";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import type { ProfileUpdateFormData } from "@/lib";
import type { ProfileData } from "@/lib/types";

import { apiPost } from "@/lib/fetcher";

interface UpdateProfileResponse {
  success: boolean;
  error?: string;
  profile?: ProfileData["profile"];
}

export function useUpdateProfile(username?: string) {
  const key = `/api/users/${username}/profile`;

  const mutation = useSWRMutation(
    key,
    async (_url, { arg }: { arg: ProfileUpdateFormData }) => {
      return apiPost<UpdateProfileResponse>(`/api/profile`, {
        body: arg,
        method: "PUT",
      });
    },
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Perfil actualizado");
          mutate(key);
        } else {
          toast.error(data.error || "Error al actualizar el perfil");
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error al actualizar el perfil");
      },
    },
  );

  return mutation;
}
