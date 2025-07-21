import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib";

interface UploadSkeletonProps {
  aspectRatio: string;
}

const UploadSkeleton = ({ aspectRatio }: UploadSkeletonProps) => {
  return (
    <div>
      <Card className="overflow-hidden py-0">
        <Skeleton className={cn("w-full", aspectRatio)} />
      </Card>
    </div>
  );
};

export default UploadSkeleton;
