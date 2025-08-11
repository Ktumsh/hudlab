"use client";

import {
  IconDots,
  IconLockExclamation,
  IconLogout,
  IconMessageReport,
  IconSettings2,
  IconShare3,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useProfile } from "../_hooks/use-profile";
import { useProfileActions } from "../_hooks/use-profile-actions";

import type { ProfileData } from "@/lib/types";

import { AvatarUploader } from "@/app/me/_components/avatar-uploader";
import ShareSheet from "@/components/share-sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfileHeader = ({
  username,
  initialData,
}: {
  username: string;
  initialData: ProfileData;
}) => {
  const { data, mutate } = useProfile({ username, initialData });

  const profile = data?.profile;
  const stats = data?.stats;
  const isFollowing = !!data?.isFollowing;
  const pathname = usePathname();
  const isSelf = pathname?.startsWith("/me/") || pathname === "/me";

  const { toggleFollow, isToggling } = useProfileActions({
    username,
    mutate,
  });

  const shareText = `Mira el perfil de ${profile?.displayName ? profile.displayName : `@${username}`} en HUDLab`;
  const shareUrl =
    (typeof window !== "undefined" &&
      `${window.location.origin}/${username}/huds`) ||
    "";

  return (
    <div className="flex items-center py-6">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-6">
        <AvatarUploader profile={profile!} isSelf={isSelf} />
        <div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-neutral-content text-2xl font-bold">
              {profile?.displayName}
            </h1>
            <div className="flex items-center gap-2">
              {isSelf ? (
                <Link href="/settings/edit" className={buttonVariants()}>
                  Editar perfil
                </Link>
              ) : (
                <Button
                  variant={isFollowing ? "default" : "primary"}
                  onClick={toggleFollow}
                  disabled={isToggling}
                >
                  {isFollowing ? "Siguiendo" : "Seguir"}
                </Button>
              )}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-md">
                    <IconDots className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <ShareSheet text={shareText} url={shareUrl}>
                    <button className="hover:bg-base-300 rounded-field hover:text-neutral-content [&_svg:not([class*='text-'])]:text-base-content/60 hover:[&_svg:not([class*='text-'])]:text-neutral-content/60 relative flex h-10 w-full items-center gap-2 px-3 py-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                      <IconShare3 />
                      Compartir
                    </button>
                  </ShareSheet>
                  {isSelf ? (
                    <>
                      <DropdownMenuItem>
                        <IconSettings2 />
                        Configuración
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        <IconLogout />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem variant="destructive">
                        <IconMessageReport />
                        Reportar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        <IconLockExclamation />
                        Bloquear
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-content-muted text-sm">@{username}</p>
          {/* Stats */}
          <div className="text-content-muted mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span>
              <strong className="text-base-content">
                {stats?.uploads ?? 0}
              </strong>{" "}
              HUDs
            </span>
            <span>
              <strong className="text-base-content">
                {stats?.followers ?? 0}
              </strong>{" "}
              seguidores
            </span>
            <span>
              <strong className="text-base-content">
                {stats?.following ?? 0}
              </strong>{" "}
              siguiendo
            </span>
          </div>
          <p className="mt-2 max-w-prose text-sm">
            Apasionado por la tecnología y los videojuegos. Compartiendo mis
            mejores HUDs y experiencias. Siempre aprendiendo y listo para nuevos
            retos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
