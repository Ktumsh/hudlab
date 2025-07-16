import { cn } from "@/lib";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-neutral rounded-box animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
