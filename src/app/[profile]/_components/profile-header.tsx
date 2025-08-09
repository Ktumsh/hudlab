"use client";

import { IconDots } from "@tabler/icons-react";
import Link from "next/link";

import { useProfile } from "../_hooks/use-profile";
import { useProfileActions } from "../_hooks/use-profile-actions";

import type { ProfileData } from "@/lib/types";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/user-avatar";

const ProfileHeader = ({
  username,
  initialData,
}: {
  username: string;
  initialData: ProfileData;
}) => {
  const { data, mutate, isLoading } = useProfile({ username, initialData });

  const profile = data?.profile;
  const stats = data?.stats;
  const isFollowing = !!data?.isFollowing;
  const isSelf = !!data?.isSelf;

  const { toggleFollow, handleShare, isToggling } = useProfileActions({
    displayName: profile?.displayName,
    username,
    mutate,
  });

  return (
    <div className="flex items-center py-6">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-6">
        <UserAvatar profile={profile!} className="size-32" />
        <div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-neutral-content text-2xl font-bold">
              {profile?.displayName}
            </h1>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="rounded-field h-10 w-20" />
              ) : isSelf ? (
                <Link href="/profile/edit" className={buttonVariants()}>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    outline
                    size="icon-md"
                    disabled={isLoading}
                  >
                    <IconDots className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    Compartir
                  </DropdownMenuItem>
                  {!isSelf && !isLoading && (
                    <>
                      <DropdownMenuItem variant="destructive">
                        Reportar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
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
