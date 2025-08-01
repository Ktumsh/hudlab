"use client";

import { IconDots } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { UploadWithProfileAndAspect } from "@/lib/types";

import AddToCollectionButton from "@/components/add-to-collection-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useForceHover } from "@/hooks/use-force-hover";
import { cn } from "@/lib";

interface UploadCardProps {
  upload: UploadWithProfileAndAspect;
}

const UploadCard = ({ upload }: UploadCardProps) => {
  const router = useRouter();

  const { elementRef, isHovered } = useForceHover();

  return (
    <div className="flex flex-col">
      <Card
        ref={elementRef}
        onClick={() => router.push(`/feed/${upload.publicId}`)}
        className={cn(
          "group bg-base-100 pointer-events-auto relative transform-gpu cursor-pointer touch-manipulation overflow-hidden py-0 transition-all duration-300 ease-out will-change-transform backface-hidden hover:shadow-lg",
          isHovered && "shadow-lg",
        )}
      >
        <Image
          priority
          src={upload.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
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

        {upload.game && (
          <div
            className={cn(
              "absolute inset-x-0 top-0 hidden overflow-hidden p-3 transition-opacity duration-300 ease-out will-change-[opacity] group-hover:opacity-0 md:block",
              isHovered && "opacity-0",
            )}
          >
            <Badge className="max-w-full border-0 bg-black/70 text-white">
              <span className="truncate">
                {upload.game?.name || "Sin juego"}
              </span>
            </Badge>
          </div>
        )}

        <div
          className={cn(
            "from-base-100/80 pointer-events-none absolute inset-0 flex flex-col items-end justify-between bg-gradient-to-t to-transparent p-3 opacity-0 transition-opacity duration-300 ease-out will-change-[opacity] group-hover:opacity-100",
            isHovered && "opacity-100",
          )}
        >
          <div className="pointer-events-auto z-10">
            <AddToCollectionButton uploadId={upload.id} />
          </div>
          <div className="pointer-events-auto max-w-full">
            <h3 className="mb-2 truncate font-semibold text-white drop-shadow-lg">
              {upload.title}
            </h3>

            {upload.description && (
              <p className="line-clamp-2 text-sm text-white/90 drop-shadow">
                {upload.description}
              </p>
            )}
          </div>
        </div>
      </Card>
      <div className="flex items-center justify-between gap-1 p-1 md:hidden">
        <h2 className="text-xxs truncate font-semibold tracking-wide">
          {upload.game?.name || "Sin juego"}
        </h2>
        <button className="relative after:absolute after:-inset-1 after:block">
          <IconDots className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
