"use client";

import { signIn } from "next-auth/react";

import { Google } from "@/components/icons/social";
import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  isSubmitting?: boolean;
  label?: string;
}

const GoogleButton = ({ isSubmitting, label }: GoogleButtonProps) => (
  <Button
    type="button"
    outline
    className="flex w-full items-center gap-2 border"
    disabled={isSubmitting}
    onClick={() => signIn("google", { callbackUrl: "/feed" })}
  >
    <Google className="size-5" />
    {label || "Continuar con Google"}
  </Button>
);

export default GoogleButton;
