import { cn } from "@/lib";

interface LoaderProps {
  className?: string;
}

const Loader = ({ className }: LoaderProps) => {
  return (
    <div
      aria-label="Cargando..."
      role="status"
      className={cn(
        "border-primary mx-auto size-8 animate-spin rounded-full border-b-2",
        className,
      )}
    />
  );
};

export default Loader;
