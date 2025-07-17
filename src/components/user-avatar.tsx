"use client";

import { useUser } from "@/hooks/use-user";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
  className?: string;
}

const UserAvatar = ({ className }: UserAvatarProps) => {
  const { user } = useUser();

  if (!user) return null;

  const avatarAlt =
    `Avatar de ${user.profile.displayName}` || "Avatar de usuario";

  return (
    <Avatar className={className}>
      {user?.profile.avatarUrl ? (
        <AvatarImage src={user.profile.avatarUrl} alt={avatarAlt} />
      ) : (
        <AvatarFallback>
          {user?.profile.displayName?.charAt(0) ?? "U"}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
