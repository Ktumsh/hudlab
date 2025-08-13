"use client";

import { IconDots } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { UploadWithDetails } from "@/lib/types";

import AddToCollectionButton from "@/components/collections/add-to-collection-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib";

interface UploadCardProps {
  upload: UploadWithDetails;
}

const UploadCard = ({ upload }: UploadCardProps) => {
  const router = useRouter();

  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      <Card
        onClick={() => router.push(`/feed/${upload.publicId}`)}
        className="group bg-base-100 pointer-events-auto relative transform-gpu cursor-pointer touch-manipulation overflow-hidden py-0 transition-all will-change-transform backface-hidden hover:shadow-lg"
      >
        <Image
          priority
          src={upload.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
          alt={upload.title}
          width={400}
          height={600}
          className={cn(
            "rounded-box h-auto transform-gpu object-cover transition-transform duration-500 will-change-transform backface-hidden group-hover:scale-105",
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {upload.game && (
          <div className="absolute inset-x-0 top-0 hidden overflow-hidden p-3 transition-opacity will-change-[opacity] group-hover:opacity-0 md:block">
            <Badge className="max-w-full border-0 bg-black/70 text-white">
              <span className="truncate">
                {upload.game?.name || "Sin juego"}
              </span>
            </Badge>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity will-change-[opacity] group-hover:opacity-100">
          <div className="pointer-events-auto z-10">
            {user && <AddToCollectionButton uploadId={upload.id} />}
          </div>
          <div className="pointer-events-auto max-w-full">
            <h3 className="mb-2 truncate text-base font-semibold text-white drop-shadow-lg">
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
