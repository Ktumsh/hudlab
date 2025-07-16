"use client";

import {
  IconDots,
  IconHeart,
  IconMessageCircle,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BetterTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib";

import type { UploadWithProfileAndAspect } from "@/lib/types";

interface UploadCardProps {
  upload: UploadWithProfileAndAspect;
}

const UploadCard = ({ upload }: UploadCardProps) => {
  const displayName = upload.profile.displayName || upload.profile.username;
  const avatarFallback = displayName.charAt(0).toUpperCase();

  const router = useRouter();

  const [favorite, setFavorite] = useState(false);

  return (
    <div className="flex flex-col">
      <Card
        onClick={() =>
          startTransition(() => router.push(`/feed/${upload.publicId}`))
        }
        className="group bg-base-100 relative cursor-pointer overflow-hidden py-0 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <Image
          priority
          src={upload.imageUrl}
          alt={upload.title}
          width={400}
          height={600}
          className={cn(
            "rounded-box h-auto object-cover transition-transform duration-300 group-hover:scale-105",
            upload.aspectRatio,
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {upload.game.name && (
          <div className="absolute top-3 left-3 hidden transition-opacity duration-300 group-hover:opacity-0 md:block">
            <Badge className="border-0 bg-black/70 text-white">
              {upload.game.name}
            </Badge>
          </div>
        )}

        <div className="from-base-100/80 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <CardContent className="flex flex-1 flex-col gap-4 p-4">
            <div className="absolute top-3 right-3 flex gap-2">
              <BetterTooltip
                content={
                  favorite ? "Quitar de favoritos" : "Añadir a favoritos"
                }
              >
                <Button
                  variant={favorite ? "primary" : "default"}
                  size="icon"
                  className={cn(
                    "bg-base-100/70 transition duration-150 hover:scale-105",
                    favorite && "bg-primary shadow-sm",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFavorite(!favorite);
                  }}
                >
                  {favorite ? <IconStarFilled /> : <IconStar />}
                </Button>
              </BetterTooltip>
            </div>
            <div className="absolute right-0 bottom-0 left-0 p-4">
              <h3 className="mb-2 truncate text-lg font-semibold text-white drop-shadow-lg">
                {upload.title}
              </h3>

              {upload.description && (
                <p className="mb-3 line-clamp-2 text-sm text-white/90 drop-shadow">
                  {upload.description}
                </p>
              )}

              {/* Información del autor */}
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="border-content-muted border-2">
                    <AvatarImage src={upload.profile.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="truncate text-sm font-medium text-white drop-shadow">
                      {displayName}
                    </p>
                    <p className="text-xs text-white/80 drop-shadow">
                      @{upload.profile.username}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center gap-1">
                    <IconHeart className="size-4" />
                    <span className="text-sm">{upload.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconMessageCircle className="size-4" />
                    <span className="text-sm">{upload.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
      <div className="flex items-center justify-between gap-1 p-1 md:hidden">
        <h2 className="text-xxs truncate font-semibold tracking-wide">
          {upload.game.name}
        </h2>
        <button className="relative after:absolute after:-inset-1 after:block">
          <IconDots className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
