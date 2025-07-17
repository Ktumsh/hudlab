"use client";

import { signIn } from "next-auth/react";

import { Discord, Google } from "@/components/icons/social";
import { Button } from "@/components/ui/button";

import LastSessionButton from "./last-session-button";

interface SocialButtonsProps {
  isSubmitting: boolean;
}

const SocialButtons = ({ isSubmitting }: SocialButtonsProps) => {
  return (
    <>
      <LastSessionButton />

      <div className="relative flex items-center">
        <div className="flex-grow border-t" />
        <span className="text-muted-foreground bg-background mx-4 px-2 text-sm">
          o
        </span>
        <div className="flex-grow border-t" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          outline
          className="flex w-full items-center gap-2"
          disabled={isSubmitting}
          onClick={() => signIn("discord", { callbackUrl: "/feed" })}
        >
          <Discord className="size-5" />
          <span>Discord</span>
        </Button>
        <Button
          type="button"
          outline
          className="flex w-full items-center gap-2"
          disabled={isSubmitting}
          onClick={() => signIn("google", { callbackUrl: "/feed" })}
        >
          <Google className="size-5" />
          <span>Google</span>
        </Button>
      </div>
    </>
  );
};

export default SocialButtons;
