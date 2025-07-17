"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

import { Discord, Google } from "@/components/icons/social";
import { Button } from "@/components/ui/button";

import { useLastSessionManager } from "../_hooks/use-last-session";

const LastSessionButton = () => {
  const { lastSession, isLoading, hasValidSession } = useLastSessionManager();

  const handleContinueAs = async () => {
    if (!lastSession || isLoading) return;

    try {
      await signIn(lastSession.provider, {
        callbackUrl: "/feed",
        loginHint: lastSession.userDisplayName,
      });
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return <Google className="size-6" />;
      case "discord":
        return <Discord className="size-6" />;
      default:
        return null;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "discord":
        return "Discord";
      case "credentials":
        return "email";
      default:
        return provider;
    }
  };

  if (!hasValidSession()) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="bg-primary/5 border-primary/20 hover:bg-primary/10 flex h-auto w-full items-center gap-3 border p-3 transition-colors"
      onClick={handleContinueAs}
      disabled={isLoading}
    >
      <div className="flex flex-1 items-center gap-3">
        {lastSession!.userAvatarUrl && (
          <Image
            src={lastSession!.userAvatarUrl}
            alt={lastSession!.userDisplayName}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover"
          />
        )}
        <div className="flex-1 text-left">
          <div className="text-foreground text-sm font-medium">
            Continuar como {lastSession!.userDisplayName}
          </div>
          <div className="text-muted-foreground text-xs">
            {getProviderName(lastSession!.provider)}
          </div>
        </div>
        {getProviderIcon(lastSession!.provider)}
      </div>
    </Button>
  );
};

export default LastSessionButton;
