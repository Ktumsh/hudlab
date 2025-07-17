"use client";

import { useCallback, useEffect, useState } from "react";

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

// Generar fingerprint único del dispositivo
const generateDeviceFingerprint = (): string => {
  try {
    if (isProductionEnvironment) {
      // En producción, usar fingerprinting más robusto
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
      // En desarrollo, usar fingerprinting más simple para debugging
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
    // Fallback simple en caso de error
    return btoa(
      "fallback_" +
        navigator.userAgent.slice(0, 30) +
        navigator.language +
        Date.now().toString(),
    ).slice(0, 32);
  }
};

export const useLastSessionManager = () => {
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar última sesión al montar el componente
  useEffect(() => {
    const loadLastSession = async () => {
      try {
        const deviceFingerprint = generateDeviceFingerprint();

        // Obtener sesión desde la base de datos
        const dbSession = await getLastSession(deviceFingerprint);

        if (dbSession) {
          // Verificar que la sesión no sea muy antigua (30 días en producción, 7 días en desarrollo)
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

  // Función para guardar una nueva sesión
  const saveLastSession = useCallback(
    async (
      sessionData: Omit<LastSession, "deviceFingerprint" | "lastUsedAt">,
    ) => {
      try {
        const deviceFingerprint = generateDeviceFingerprint();

        // Guardar en la base de datos
        await saveLastSessionDB(
          deviceFingerprint,
          sessionData.userId,
          sessionData.provider,
          sessionData.userDisplayName,
          sessionData.userAvatarUrl,
        );

        // Actualizar el estado local
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

  // Función para limpiar la sesión actual
  const clearLastSession = useCallback(() => {
    try {
      // Solo limpiar el estado local
      // La BD mantiene el historial para otros dispositivos
      setLastSession(null);

      if (!isProductionEnvironment) {
        console.log("Last session cleared from local state");
      }
    } catch (error) {
      console.error("Error clearing last session:", error);
    }
  }, []);

  // Función para limpiar una sesión específica (para usar cuando el usuario explícitamente lo desee)
  const clearSpecificSession = useCallback(
    (userId: string, provider: string) => {
      try {
        // Solo limpiar si coincide con la sesión actual
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

  // Función para verificar si hay una sesión válida
  const hasValidSession = useCallback((): boolean => {
    return (
      !isLoading &&
      lastSession !== null &&
      lastSession.provider !== "credentials"
    );
  }, [isLoading, lastSession]);

  return {
    lastSession,
    isLoading,
    saveLastSession,
    clearLastSession,
    clearSpecificSession,
    hasValidSession,
    generateDeviceFingerprint,
  };
};

export default useLastSessionManager;
