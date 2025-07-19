"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { getFirstName } from "@/lib";

import { useLastSession } from "../../../hooks/use-last-session";

/**
 * Componente para manejar automáticamente el guardado de sesiones
 * cuando el usuario inicia sesión exitosamente
 */
const SessionTracker = () => {
  const { data: session, status } = useSession();
  const { saveLastSession } = useLastSession();
  const lastSavedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const handleSessionSave = async () => {
      // Solo procesar cuando la sesión esté autenticada y cargada completamente
      if (status === "authenticated" && session?.user) {
        const { user } = session;

        // Verificar que tengamos la información necesaria
        if (user.id && user.email) {
          // Determinar el provider basado en la información de la sesión
          let provider = "credentials"; // default

          // Intentar determinar el provider basado en el avatar URL
          if (user.image) {
            if (user.image.includes("googleusercontent.com")) {
              provider = "google";
            } else if (user.image.includes("cdn.discordapp.com")) {
              provider = "discord";
            }
          }

          // Solo guardar sesiones de OAuth (no credentials)
          if (provider !== "credentials") {
            const sessionKey = `${user.id}-${provider}`;

            // Evitar guardar la misma sesión múltiples veces
            if (lastSavedSessionRef.current !== sessionKey) {
              const displayName = user.name || user.email.split("@")[0];
              const sessionData = {
                userId: user.id,
                provider: provider,
                userDisplayName: getFirstName(displayName),
                userAvatarUrl: user.image || undefined,
              };

              try {
                await saveLastSession(sessionData);
                lastSavedSessionRef.current = sessionKey;
              } catch (error) {
                console.error("Error saving session:", error);
              }
            }
          }
        }
      } else if (status === "unauthenticated") {
        // Si el usuario se desconecta, limpiar la referencia pero no el localStorage
        // para que pueda ver su última sesión cuando regrese
        lastSavedSessionRef.current = null;
      }
    };

    handleSessionSave();
  }, [session, status, saveLastSession]);
  return null;
};

export default SessionTracker;
