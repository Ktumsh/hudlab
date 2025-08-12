"use client";

import Link from "next/link";

import ProfileOptions from "./profile-options";
import { Button, buttonVariants } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

import { useIsSelfProfile } from "@/hooks/use-is-self-profile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";
import { Profile } from "@/lib/types";

interface ProfileActionsProps {
  profile?: Profile | null;
  onToggleFollow: () => Promise<void>;
  isToggling: boolean;
  isFollowing: boolean;
  isLoading: boolean;
}

const ProfileActions = ({
  profile,
  onToggleFollow,
  isToggling,
  isFollowing,
  isLoading,
}: ProfileActionsProps) => {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const isSelf = useIsSelfProfile();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {isSelf ? (
        <Link
          href="/settings/edit"
          className={buttonVariants({
            size: isMobile ? "sm" : "default",
            className: "flex-1 md:flex-auto",
          })}
        >
          Editar perfil
        </Link>
      ) : isLoading ? (
        <Skeleton className="rounded-field h-10 w-24" />
      ) : (
        <Button
          size={isMobile ? "sm" : "default"}
          variant={isFollowing ? "default" : "primary"}
          onClick={onToggleFollow}
          disabled={isToggling}
          className="flex-1 md:flex-auto"
        >
          {isFollowing ? "Siguiendo" : "Seguir"}
        </Button>
      )}
      <ProfileOptions profile={profile} isSelf={isSelf} />
    </div>
  );
};

export default ProfileActions;
