import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib";

interface UploadSkeletonProps {
  height?: number; // altura fija en px (236 o 256)
}

const UploadSkeleton = ({ height = 256 }: UploadSkeletonProps) => {
  return (
    <Card className="overflow-hidden py-0">
      <Skeleton className={cn("w-full")} style={{ height }} />
    </Card>
  );
};

export default UploadSkeleton;
