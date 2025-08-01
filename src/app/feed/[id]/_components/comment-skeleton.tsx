import { IconDots, IconHeart } from "@tabler/icons-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateToNow } from "@/lib";

interface CommentSkeletonProps {
  content: string;
}

const CommentSkeleton = ({ content }: CommentSkeletonProps) => (
  <div className="mb-2 flex items-start gap-2 last:mb-0">
    <Avatar className="size-7 md:size-8">
      <Skeleton className="h-full w-full rounded-full" />
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-neutral-content cursor-pointer text-sm font-semibold text-nowrap hover:underline md:text-base">
          Tú
        </span>
        <span className="text-base-content/60 text-xxs md:text-xs">
          {formatDateToNow(new Date())}
        </span>
      </div>
      <p className="text-base-content text-sm md:text-base">{content}</p>
      <div className="flex h-6 items-center gap-2">
        <div className="text-xxs flex items-center md:text-xs">
          <div className="grid size-6 place-content-center border border-transparent">
            <IconHeart className="size-3.5 md:size-4" />
          </div>
          0
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xxs pointer-events-none h-6 border-0 hover:bg-transparent md:text-xs"
        >
          Responder
        </Button>
        <div className="grid size-6 place-content-center border border-transparent">
          <IconDots className="size-3.5 md:size-4" />
        </div>
      </div>
    </div>
  </div>
);

export default CommentSkeleton;
