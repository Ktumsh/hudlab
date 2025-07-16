import * as React from "react";

import { cn } from "@/lib";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "input-neutral input-ghost bg-base-200 focus-visible:bg-base-300! placeholder:text-content-muted aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error dark:bg-input/30 rounded-box flex field-sizing-content max-h-60 min-h-16 w-full resize-none border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
