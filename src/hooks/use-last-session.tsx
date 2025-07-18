"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  getLastSession,
  saveLastSession as saveLastSessionDB,
} from "@/db/querys/user-querys";
import { isProductionEnvironment } from "@/lib/consts";

interface LastSession {
  userId: string;
  provider: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  deviceFingerprint: string;
  lastUsedAt: Date;
}

interface LastSessionContextType {
  lastSession: LastSession | null;
  isLoading: boolean;
  hasValidSession: boolean;
  saveLastSession: (
    sessionData: Omit<LastSession, "deviceFingerprint" | "lastUsedAt">,
  ) => Promise<void>;
  clearLastSession: () => void;
  clearSpecificSession: (userId: string, provider: string) => void;
  generateDeviceFingerprint: () => string;
}

const LastSessionContext = createContext<LastSessionContextType | undefined>(
  undefined,
);

const generateDeviceFingerprint = (): string => {
  try {
    if (isProductionEnvironment) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#00FF00";
        ctx.fillText("HUDLab Device Fingerprint", 2, 2);
      }
      const canvasFingerprint = canvas.toDataURL();

      const fingerprint = btoa(
        navigator.userAgent +
          navigator.language +
          (navigator.languages ? navigator.languages.join(",") : "") +
          screen.width +
          screen.height +
          screen.colorDepth +
          screen.pixelDepth +
          new Date().getTimezoneOffset() +
          (navigator.hardwareConcurrency || 0) +
          ((navigator as any).deviceMemory || 0) +
          canvasFingerprint.slice(0, 100),
      ).slice(0, 64);

      return fingerprint;
    } else {
      return btoa(
        "dev_" +
          navigator.userAgent.slice(0, 50) +
          navigator.language +
          screen.width +
          screen.height,
      ).slice(0, 32);
    }
  } catch (error) {
    console.error("Error generating device fingerprint:", error);
    return btoa(
      "fallback_" +
        navigator.userAgent.slice(0, 30) +
        navigator.language +
        Date.now().toString(),
    ).slice(0, 32);
  }
};

interface LastSessionProviderProps {
  children: React.ReactNode;
}

export const LastSessionProvider: React.FC<LastSessionProviderProps> = ({
  children,
}) => {
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLastSession = async () => {
      try {
        const deviceFingerprint = generateDeviceFingerprint();

        const dbSession = await getLastSession(deviceFingerprint);

        if (dbSession) {
          const maxAge = isProductionEnvironment ? 30 : 7;
          const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
          const cutoffTime = Date.now() - maxAgeMs;
          const sessionTime = dbSession.lastUsedAt
            ? new Date(dbSession.lastUsedAt).getTime()
            : 0;

          if (sessionTime > cutoffTime && dbSession.lastUsedAt) {
            const sessionData: LastSession = {
              userId: dbSession.userId,
              provider: dbSession.provider,
              userDisplayName: dbSession.userDisplayName,
              userAvatarUrl: dbSession.userAvatarUrl || undefined,
              deviceFingerprint: dbSession.deviceFingerprint,
              lastUsedAt: dbSession.lastUsedAt,
            };
            setLastSession(sessionData);
          }
        }
      } catch (error) {
        console.error("Error loading last session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLastSession();
  }, []);

  const saveLastSession = useCallback(
    async (
      sessionData: Omit<LastSession, "deviceFingerprint" | "lastUsedAt">,
    ) => {
      try {
        const deviceFingerprint = generateDeviceFingerprint();

        await saveLastSessionDB(
          deviceFingerprint,
          sessionData.userId,
          sessionData.provider,
          sessionData.userDisplayName,
          sessionData.userAvatarUrl,
        );

        const newSession: LastSession = {
          ...sessionData,
          deviceFingerprint,
          lastUsedAt: new Date(),
        };
        setLastSession(newSession);

        if (!isProductionEnvironment) {
          console.log("Last session saved to DB:", newSession);
        }
      } catch (error) {
        console.error("Error saving last session:", error);
      }
    },
    [],
  );

  const clearLastSession = useCallback(() => {
    try {
      setLastSession(null);

      if (!isProductionEnvironment) {
        console.log("Last session cleared from local state");
      }
    } catch (error) {
      console.error("Error clearing last session:", error);
    }
  }, []);

  const clearSpecificSession = useCallback(
    (userId: string, provider: string) => {
      try {
        if (
          lastSession &&
          lastSession.userId === userId &&
          lastSession.provider === provider
        ) {
          setLastSession(null);
          console.log(`Cleared specific session for ${userId} - ${provider}`);
        }
      } catch (error) {
        console.error("Error clearing specific session:", error);
      }
    },
    [lastSession],
  );

  const hasValidSession = useMemo((): boolean => {
    return (
      !isLoading &&
      lastSession !== null &&
      lastSession.provider !== "credentials"
    );
  }, [isLoading, lastSession]);

  const value: LastSessionContextType = {
    lastSession,
    isLoading,
    saveLastSession,
    clearLastSession,
    clearSpecificSession,
    hasValidSession,
    generateDeviceFingerprint,
  };

  return (
    <LastSessionContext.Provider value={value}>
      {children}
    </LastSessionContext.Provider>
  );
};

// Hook para usar el contexto
export const useLastSession = (): LastSessionContextType => {
  const context = useContext(LastSessionContext);
  if (context === undefined) {
    throw new Error("useLastSession must be used within a LastSessionProvider");
  }
  return context;
};
