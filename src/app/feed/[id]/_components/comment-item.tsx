import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

import OptionsMenu from "./options-menu";

import Loader from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDateToNow, formatDisplayName } from "@/lib";

interface CommentItemProps {
  user: { displayName: string; avatarUrl?: string; id: string };
  content: string;
  createdAt: Date;
  likes: number;
  liked: boolean;
  isOwn: boolean;
  expanded: boolean;
  isDeleting?: boolean;
  onLike: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  replyReference?: React.ReactNode;
  children?: React.ReactNode;
}

const CommentItem = ({
  user,
  content,
  createdAt,
  likes,
  liked,
  isOwn,
  expanded = false,
  isDeleting = false,
  onLike,
  onReply,
  onEdit,
  onDelete,
  replyReference,
  children,
}: CommentItemProps) => {
  return (
    <div
      className={`mb-2 flex items-start gap-2 last:mb-0 ${isDeleting ? "pointer-events-none opacity-50" : ""}`}
    >
      <Avatar className={expanded ? "size-7 md:size-8" : "size-6 md:size-7"}>
        <AvatarImage src={user.avatarUrl || undefined} />
        <AvatarFallback> {formatDisplayName(user.displayName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-neutral-content cursor-pointer text-sm font-semibold text-nowrap hover:underline md:text-base">
            {user.displayName}
          </span>
          <span className="text-base-content/60 text-xxs md:text-xs">
            {formatDateToNow(createdAt)}
          </span>
          {isDeleting && (
            <div className="flex items-center gap-1.5">
              <span className="text-error text-xs">Eliminando</span>
              <Loader className="border-error size-3" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {replyReference}
          <p className="text-base-content text-sm md:text-base">{content}</p>
        </div>
        {expanded && (
          <div className="text-xxs flex items-center gap-2 md:text-xs">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Me gusta"
                className="size-6"
                onClick={onLike}
              >
                {liked ? (
                  <IconHeartFilled className="size-3.5 text-red-500 md:size-4" />
                ) : (
                  <IconHeart className="size-3.5 md:size-4" />
                )}
              </Button>
              <span>{likes}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xxs h-6 border-0 hover:bg-transparent md:text-xs"
              onClick={onReply}
            >
              Responder
            </Button>
            <OptionsMenu isOwn={isOwn} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default CommentItem;
