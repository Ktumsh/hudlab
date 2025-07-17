"use client";

import { useCallback, useEffect, useState } from "react";

import { isProductionEnvironment } from "@/lib/consts";

interface LastSession {
  userId: string;
  provider: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  fingerprint: string;
  timestamp: number;
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
        const fingerprint = generateDeviceFingerprint();
        const sessionKey = `hudlab_session_${fingerprint}`;

        const savedSession = localStorage.getItem(sessionKey);
        if (savedSession) {
          const parsed = JSON.parse(savedSession) as LastSession;

          // Verificar que la sesión no sea muy antigua (30 días en producción, 7 días en desarrollo)
          const maxAge = isProductionEnvironment ? 30 : 7;
          const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
          const cutoffTime = Date.now() - maxAgeMs;

          if (parsed.timestamp && parsed.timestamp > cutoffTime) {
            // Verificar que el fingerprint coincida para seguridad
            if (parsed.fingerprint === fingerprint) {
              setLastSession(parsed);
            } else {
              // Si el fingerprint no coincide, es posible que el dispositivo haya cambiado
              console.warn("Device fingerprint mismatch, clearing session");
              localStorage.removeItem(sessionKey);
            }
          } else {
            // Limpiar sesión expirada
            localStorage.removeItem(sessionKey);
          }
        }
      } catch (error) {
        console.error("Error loading last session:", error);
        // En caso de error, limpiar posibles datos corruptos
        try {
          const fingerprint = generateDeviceFingerprint();
          localStorage.removeItem(`hudlab_session_${fingerprint}`);
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLastSession();
  }, []);

  // Función para guardar una nueva sesión
  const saveLastSession = useCallback(
    (sessionData: Omit<LastSession, "fingerprint" | "timestamp">) => {
      try {
        const fingerprint = generateDeviceFingerprint();
        const sessionKey = `hudlab_session_${fingerprint}`;

        const sessionToSave: LastSession = {
          ...sessionData,
          fingerprint,
          timestamp: Date.now(),
        };

        localStorage.setItem(sessionKey, JSON.stringify(sessionToSave));
        setLastSession(sessionToSave);

        if (!isProductionEnvironment) {
          console.log("Last session saved:", sessionToSave);
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
      const fingerprint = generateDeviceFingerprint();
      const sessionKey = `hudlab_session_${fingerprint}`;

      localStorage.removeItem(sessionKey);
      setLastSession(null);

      if (!isProductionEnvironment) {
        console.log("Last session cleared");
      }
    } catch (error) {
      console.error("Error clearing last session:", error);
    }
  }, []);

  // Función para limpiar una sesión específica (para usar cuando el usuario explícitamente lo desee)
  const clearSpecificSession = useCallback(
    (userId: string, provider: string) => {
      try {
        const fingerprint = generateDeviceFingerprint();
        const sessionKey = `hudlab_session_${fingerprint}`;

        const savedSession = localStorage.getItem(sessionKey);
        if (savedSession) {
          const parsed = JSON.parse(savedSession) as LastSession;

          // Solo limpiar si coincide con el usuario/provider específico
          if (parsed.userId === userId && parsed.provider === provider) {
            localStorage.removeItem(sessionKey);
            setLastSession(null);
            console.log(`Cleared specific session for ${userId} - ${provider}`);
          }
        }
      } catch (error) {
        console.error("Error clearing specific session:", error);
      }
    },
    [],
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
