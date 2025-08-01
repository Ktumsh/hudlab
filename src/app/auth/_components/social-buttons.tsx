"use client";

import { useState } from "react";

import { Discord, Google } from "@/components/icons/social";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface SocialButtonsProps {
  isSubmitting: boolean;
}

type OAuthProvider = "google" | "discord";

const SocialButtons = ({ isSubmitting }: SocialButtonsProps) => {
  const { signInWithOAuth } = useAuth();
  const [isOAuthLoading, setIsOAuthLoading] = useState<OAuthProvider | null>(
    null,
  );

  const handleOAuthSignIn = async (provider: OAuthProvider): Promise<void> => {
    if (isSubmitting || isOAuthLoading) return;

    setIsOAuthLoading(provider);

    try {
      await signInWithOAuth(provider);
    } catch (error) {
      // El error ya se maneja en el hook useAuth
      console.error("OAuth error:", error);
    } finally {
      setIsOAuthLoading(null);
    }
  };

  return (
    <>
      <div className="relative flex items-center">
        <div className="flex-grow border-t" />
        <span className="text-content-muted bg-background mx-4 px-2 text-sm">
          o
        </span>
        <div className="flex-grow border-t" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          outline
          className="flex w-full items-center gap-2"
          disabled={isSubmitting || isOAuthLoading !== null}
          onClick={() => handleOAuthSignIn("discord")}
          aria-label="Iniciar sesión con Discord"
        >
          <Discord className="size-5" />
          <span>
            {isOAuthLoading === "discord" ? "Cargando..." : "Discord"}
          </span>
        </Button>

        <Button
          type="button"
          outline
          className="flex w-full items-center gap-2"
          disabled={isSubmitting || isOAuthLoading !== null}
          onClick={() => handleOAuthSignIn("google")}
          aria-label="Iniciar sesión con Google"
        >
          <Google className="size-5" />
          <span>{isOAuthLoading === "google" ? "Cargando..." : "Google"}</span>
        </Button>
      </div>
    </>
  );
};

export default SocialButtons;
