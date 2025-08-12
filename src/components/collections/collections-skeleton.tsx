"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib";

interface CollectionsSkeletonProps {
  count?: number;
  className?: string;
}

const CollectionsSkeleton = ({
  count = 8,
  className,
}: CollectionsSkeletonProps) => {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="group">
          <div className="rounded-box relative overflow-hidden">
            <div className="flex h-4/5 gap-0.5">
              <div className="w-2/3">
                <Skeleton className="h-full rounded-none" />
              </div>
              <div className="flex w-1/3 flex-col gap-0.5">
                <Skeleton className="aspect-square rounded-none" />
                <Skeleton className="aspect-square rounded-none" />
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-3">
            <Skeleton className="mb-2 h-5 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionsSkeleton;
