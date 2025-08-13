import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib";

const badgeVariants = cva("badge [&>svg]:size-3.5 text-sm", {
  variants: {
    variant: {
      default: "",
      primary: "badge-primary",
      secondary: "badge-secondary",
      accent: "badge-accent",
      success: "badge-success",
      info: "badge-info",
      warning: "badge-warning",
      error: "badge-error",
      outline: "badge-outline border-border",
    },
    size: {
      default: "",
      sm: "badge-sm",
      md: "badge-md",
      lg: "badge-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function Badge({
  className,
  variant,
  size,
  asChild = false,
  soft = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; soft?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        soft && "badge-soft",
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
