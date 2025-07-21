import { Skeleton } from "@/components/ui/skeleton";

interface UploadSearchSkeletonProps {
  count?: number;
}

const UploadSearchSkeleton = ({ count = 4 }: UploadSearchSkeletonProps) => {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-12" />
      <div className="grid gap-2">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="relative h-12">
            <div className="flex items-center space-x-4">
              {/* Search icon skeleton */}
              <Skeleton className="size-5 rounded" />

              {/* Content skeleton */}
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadSearchSkeleton;
