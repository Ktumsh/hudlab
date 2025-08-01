import { IconArrowUp } from "@tabler/icons-react";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import useScrollToUp from "@/hooks/use-scroll-to-up";
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
  const { scrollToTop } = useScrollToUp();
  return (
    <div
      className={cn(
        "relative z-2 mt-6 mb-24 flex flex-col items-center gap-2 md:mb-32",
        className,
      )}
    >
      {isLoadingMore && <Loader className="mx-auto size-6" />}
      {isReachingEnd && !isLoadingInitial && hasUploads && (
        <div className="animate-in fade-in-0 flex w-full max-w-xs flex-col items-center">
          <span className="text-primary mb-2 text-base font-semibold">
            ¡Fin del feed!
          </span>
          <p className="text-content-muted mb-4 text-center text-sm">
            Has visto todos los HUDs disponibles.
          </p>
          <p className="mb-2">¿Volver arriba?</p>
          <Button
            size="icon"
            outline
            className="mx-auto mt-1 flex items-center gap-2"
            onClick={scrollToTop}
            aria-label="Subir al inicio"
          >
            <IconArrowUp className="size-4" />
            <span className="sr-only">Subir arriba</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FooterStatus;
