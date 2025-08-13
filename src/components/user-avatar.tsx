"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

import type { Profile, UserComment, UserSearchResult } from "@/lib/types";

import { formatDisplayName } from "@/lib";

interface UserAvatarProps {
  profile: Profile | UserComment | UserSearchResult | undefined;
  loading?: boolean;
  className?: string;
}

const UserAvatar = ({
  profile,
  loading,
  className,
  ...props
}: UserAvatarProps & React.ComponentProps<typeof Avatar>) => {
  if (loading) {
    return (
      <Avatar className={className} {...props}>
        <Skeleton className="size-full rounded-full" />
      </Avatar>
    );
  }

  if (!profile) {
    return (
      <Avatar className={className} {...props}>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
  }

  const avatarAlt = profile.displayName
    ? `Avatar de ${profile.displayName}`
    : "Avatar de usuario";

  return (
    <Avatar className={className} {...props}>
      {profile.avatarUrl ? (
        <AvatarImage src={profile.avatarUrl} alt={avatarAlt} />
      ) : (
        <AvatarFallback>
          {formatDisplayName(profile.displayName)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
