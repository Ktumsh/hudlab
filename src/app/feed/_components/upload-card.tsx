"use client";

import { IconDots, IconStar, IconStarFilled } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BetterTooltip } from "@/components/ui/tooltip";
import { useForceHover } from "@/hooks/use-force-hover";
import { cn } from "@/lib";

import type { UploadWithProfileAndAspect } from "@/lib/types";

interface UploadCardProps {
  upload: UploadWithProfileAndAspect;
}

const UploadCard = ({ upload }: UploadCardProps) => {
  const router = useRouter();

  const { elementRef, isHovered } = useForceHover();

  const [favorite, setFavorite] = useState(false);

  return (
    <div className="flex flex-col" data-masonry-item>
      <Card
        ref={elementRef}
        onClick={() => router.push(`/feed/${upload.publicId}`)}
        className={cn(
          "group bg-base-100 pointer-events-auto relative transform-gpu cursor-pointer touch-manipulation overflow-hidden py-0 transition-all duration-300 ease-out will-change-transform backface-hidden hover:-translate-y-1 hover:shadow-lg",
          isHovered && "-translate-y-1 transform shadow-lg",
        )}
      >
        <Image
          priority
          src={upload.imageUrl}
          alt={upload.title}
          width={400}
          height={600}
          className={cn(
            "rounded-box h-auto transform-gpu object-cover transition-transform duration-300 ease-out will-change-transform backface-hidden group-hover:scale-105",
            upload.aspectRatio,
            isHovered && "scale-105 transform",
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {upload.game.name && (
          <div
            className={cn(
              "absolute top-3 left-3 hidden transition-opacity duration-300 ease-out will-change-auto group-hover:opacity-0 md:block",
              isHovered && "opacity-0",
            )}
          >
            <Badge className="border-0 bg-black/70 text-white">
              {upload.game.name}
            </Badge>
          </div>
        )}

        <div
          className={cn(
            "from-base-100/80 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-300 ease-out will-change-auto group-hover:opacity-100",
            isHovered && "opacity-100",
          )}
          style={{ willChange: "opacity" }}
        >
          <CardContent className="flex flex-1 flex-col gap-4 p-4">
            <div className="absolute top-3 right-3 z-10 flex gap-2">
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
              <h3 className="mb-2 truncate font-semibold text-white drop-shadow-lg">
                {upload.title}
              </h3>

              {upload.description && (
                <p className="line-clamp-2 text-sm text-white/90 drop-shadow">
                  {upload.description}
                </p>
              )}
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
