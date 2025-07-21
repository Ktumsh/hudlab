import { Skeleton } from "@/components/ui/skeleton";

interface UserSearchSkeletonProps {
  count?: number;
}

const UserSearchSkeleton = ({ count = 2 }: UserSearchSkeletonProps) => {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-16" />
      <div className="grid gap-1">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="relative h-14 w-full">
            <div className="flex items-center space-x-3 px-1">
              {/* Avatar skeleton */}
              <Skeleton className="size-9 rounded-full" />

              {/* User info skeleton */}
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearchSkeleton;
