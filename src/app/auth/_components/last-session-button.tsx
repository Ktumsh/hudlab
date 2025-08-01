"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { memo } from "react";

import { useLastSession } from "../../../hooks/use-last-session";

import { Discord, Google } from "@/components/icons/social";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib";

const PureLastSessionButton = () => {
  const { lastSession, isLoading, hasValidSession } = useLastSession();

  const handleContinueAs = async () => {
    if (!lastSession || isLoading) return;

    try {
      // Redirigir al endpoint OAuth del backend
      window.location.href = `${apiUrl}/api/auth/signin/${lastSession.provider}?callbackUrl=${encodeURIComponent(window.location.origin + "/feed")}`;
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

  if (!hasValidSession) {
    return null;
  }

  const MotionButton = motion(Button);

  return (
    <MotionButton
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
          <div className="text-content-muted text-xs">
            {getProviderName(lastSession!.provider)}
          </div>
        </div>
        {getProviderIcon(lastSession!.provider)}
      </div>
    </MotionButton>
  );
};

export default memo(PureLastSessionButton);
