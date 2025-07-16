import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib";

interface UploadSkeletonProps {
  aspectRatio: string;
}

const UploadSkeleton = ({ aspectRatio }: UploadSkeletonProps) => {
  return (
    <Card className="overflow-hidden py-0">
      <Skeleton className={cn("w-full", aspectRatio)} />
    </Card>
  );
};

export default UploadSkeleton;
