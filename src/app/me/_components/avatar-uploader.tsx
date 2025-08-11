"use client";

import { IconCheck, IconPhotoUp, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import type { Profile } from "@/lib/types";

import { useAvatarUpload } from "@/app/me/_hooks/use-avatar-upload";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BetterTooltip } from "@/components/ui/tooltip";
import UserAvatar from "@/components/user-avatar";
import { cn, formErrors } from "@/lib";

interface AvatarUploaderProps {
  profile: Profile;
  isSelf: boolean;
}

export function AvatarUploader({ isSelf, profile }: AvatarUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { trigger: uploadAvatar, isMutating: uploading } = useAvatarUpload(
    profile.username,
  );

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !!preview) return;
    if (!f.type.match(/image\/(jpeg|png|webp)/)) {
      toast.error(formErrors.invalid.avatarFormat);
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error(formErrors.length.avatarMax);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    e.target.value = "";
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await uploadAvatar(formData);
      reset();
    } catch (error) {
      console.error("Error al cambiar el avatar:", error);
    }
  };

  if (!isSelf) {
    return <UserAvatar profile={profile!} className="size-32" />;
  }

  return (
    <div className="relative">
      <label htmlFor="dropzone-file" className="group relative rounded-full">
        {preview ? (
          <Avatar className="size-32">
            <AvatarImage src={preview} alt="Previsualización de avatar" />
          </Avatar>
        ) : (
          <UserAvatar profile={profile!} className="size-32" />
        )}
        <input
          id="dropzone-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          max="2MB"
          disabled={uploading || !!preview}
          onChange={onSelectFile}
          className="hidden"
        />
        <div
          className={cn(
            "bg-base-100/50 absolute inset-0 grid cursor-pointer place-content-center rounded-full opacity-0 transition-opacity group-hover:opacity-100",
            preview && "hidden",
          )}
        >
          <BetterTooltip content="Cambiar avatar">
            <div className="bg-base-100 grid size-10 place-content-center rounded-full transition-transform hover:scale-105">
              <IconPhotoUp className="size-5" />
            </div>
          </BetterTooltip>
        </div>
      </label>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.8 }}
        animate={{
          opacity: preview ? 1 : 0,
          y: preview ? 0 : -10,
          scale: preview ? 1 : 0.8,
        }}
        exit={{ opacity: 0, y: -10, scale: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className={cn(
          "absolute inset-x-0 -bottom-12 z-10 flex items-center justify-center gap-2",
          preview ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <BetterTooltip content="Restablecer">
          <Button size="icon-md" onClick={reset} className="text-error">
            <IconX className="size-5" />
          </Button>
        </BetterTooltip>
        <BetterTooltip content="Guardar">
          <Button
            size="icon-md"
            onClick={handleUpload}
            disabled={uploading}
            className="text-success"
          >
            <IconCheck className="size-5" />
          </Button>
        </BetterTooltip>
      </motion.div>
    </div>
  );
}
