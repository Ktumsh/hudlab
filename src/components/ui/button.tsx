import { Slot } from "@radix-ui/react-slot";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/index";

const buttonVariants = cva(
  "btn rounded-field [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 text-sm",
  {
    variants: {
      variant: {
        default: "",
        neutral: "btn-neutral",
        primary: "btn-primary",
        secondary: "btn-secondary",
        accent: "btn-accent",
        info: "btn-info",
        success: "btn-success",
        warning: "btn-warning",
        error: "btn-error",
        ghost:
          "btn-ghost hover:bg-base-200 hover:text-neutral-content hover:border-base-200",
        link: "group btn-link no-underline underline-offset-2 text-base-content hover:text-neutral-content h-auto border-0 px-0 transition *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current",
      },
      size: {
        default: "",
        xs: "btn-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "btn-sm text-xs",
        lg: "btn-lg",
        xl: "btn-xl text-lg",
        icon: "size-8 p-0",
        "icon-xs": "size-6 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 p-0",
        "icon-md": "size-10 p-0",
        "icon-lg": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  soft = false,
  wide = false,
  outline = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    soft?: boolean;
    wide?: boolean;
    outline?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), {
        "btn-soft": soft,
        "btn-wide max-w-full": wide,
        "btn-outline border-border": outline,
      })}
      {...props}
    />
  );
}

type ButtonPasswordType = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

function ButtonPassword({ isVisible, setIsVisible }: ButtonPasswordType) {
  return (
    <button
      type="button"
      className="text-content-muted absolute top-0 right-0 z-10 inline-flex h-full items-center justify-center px-3"
      onClick={() => setIsVisible(!isVisible)}
    >
      {isVisible ? (
        <IconEye className="size-5" />
      ) : (
        <IconEyeOff className="size-5" />
      )}
      <span className="sr-only">
        {isVisible ? "Hide password" : "Show password"}
      </span>
    </button>
  );
}

export { Button, ButtonPassword, buttonVariants };
