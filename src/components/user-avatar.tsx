"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { useUser } from "@/hooks/use-user";
import { formatDisplayName } from "@/lib";

interface UserAvatarProps {
  className?: string;
}

const UserAvatar = ({ className }: UserAvatarProps) => {
  const { user } = useUser();

  if (!user) return null;

  const avatarAlt = user.profile.displayName
    ? `Avatar de ${user.profile.displayName}`
    : "Avatar de usuario";

  return (
    <Avatar className={className}>
      {user?.profile.avatarUrl ? (
        <AvatarImage src={user.profile.avatarUrl} alt={avatarAlt} />
      ) : (
        <AvatarFallback>
          {formatDisplayName(user.profile.displayName)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
