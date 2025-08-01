"use client";

import type { UserSearchResult } from "@/lib/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDisplayName } from "@/lib";

interface UserResultCardProps {
  user: UserSearchResult;
  onSelect: (username: string) => void;
}

const UserResultCard = ({ user, onSelect }: UserResultCardProps) => {
  return (
    <button
      className="group/result relative h-14 w-full text-left"
      onClick={() => onSelect(user.username)}
    >
      <div className="flex items-center space-x-3 px-1">
        {/* Avatar del usuario */}
        <Avatar className="size-9">
          <AvatarImage src={user.avatarUrl || undefined} />
          <AvatarFallback className="text-xs font-medium">
            {formatDisplayName(user.displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Información del usuario */}
        <div className="min-w-0 flex-1">
          <h3 className="group-hover/result:text-neutral-content truncate text-sm font-medium transition-colors">
            {user.displayName}
          </h3>
          <p className="text-base-content/60 group-hover/result:text-base-content/80 truncate text-xs transition-colors">
            @{user.username}
          </p>
        </div>
      </div>

      {/* Fondo hover */}
      <div className="bg-base-300 rounded-box absolute -inset-x-3 -inset-y-1 -z-1 scale-y-50 opacity-0 transition group-hover/result:scale-y-100 group-hover/result:opacity-100"></div>
    </button>
  );
};

export default UserResultCard;
