import { IconLoader2 } from "@tabler/icons-react";

import { cn } from "@/lib";

interface FooterStatusProps {
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  isReachingEnd: boolean;
  hasUploads: boolean;
  className?: string;
}

const FooterStatus = ({
  isLoadingInitial,
  isLoadingMore,
  isReachingEnd,
  hasUploads,
  className,
}: FooterStatusProps) => {
  return (
    <div className={cn("relative z-2 mt-6 mb-32", className)}>
      {isLoadingMore && (
        <IconLoader2 className="text-content-muted mx-auto size-6 animate-spin" />
      )}
      {isReachingEnd && !isLoadingInitial && hasUploads && (
        <p className="text-center text-sm">
          ¡Has visto todos los HUDs disponibles!
        </p>
      )}
    </div>
  );
};

export default FooterStatus;
