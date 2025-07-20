import * as React from "react";

import { cn } from "@/lib";

function Input({
  className,
  type,
  isAuth,
  ...props
}: React.ComponentProps<"input"> & { isAuth?: boolean }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "input input-ghost border-border input-neutral outline-base-content/50! selection:bg-primary selection:text-primary-content w-full",
        "aria-invalid:ring-error/50! aria-invalid:border-error/30",
        className,
        isAuth && "bg-base-100 h-11 text-base",
      )}
      {...props}
    />
  );
}

export { Input };
