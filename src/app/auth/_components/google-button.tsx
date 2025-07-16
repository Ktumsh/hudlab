"use client";

import { signIn } from "next-auth/react";

import { Google } from "@/components/icons/social";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleButtonProps {
  isSubmitting?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const GoogleButton = ({
  isSubmitting,
  className,
  children,
}: GoogleButtonProps) => (
  <Button
    type="button"
    outline
    className={cn(
      "flex w-full items-center gap-2 border border-gray-300",
      className,
    )}
    disabled={isSubmitting}
    onClick={() => signIn("google")}
  >
    <Google width={22} height={22} />
    {children ?? "Continuar con Google"}
  </Button>
);

export default GoogleButton;
