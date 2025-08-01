"use client";

import { Card, CardContent } from "@/components/ui/card";
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
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Cover Image Skeleton */}
            <Skeleton className="aspect-square" />

            {/* Content Skeleton */}
            <div className="space-y-3 p-4">
              {/* Title */}
              <Skeleton className="h-4" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-3 w-20" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CollectionsSkeleton;
