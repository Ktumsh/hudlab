"use client";

import { useEffect, useRef } from "react";

import { useLastSession } from "../../../hooks/use-last-session";

import { useAuth } from "@/hooks/use-auth";
import { getFirstName } from "@/lib";

/**
 * Componente para manejar automáticamente el guardado de sesiones
 * cuando el usuario inicia sesión exitosamente
 */
const SessionTracker = () => {
  const { user, isLoading } = useAuth();
  const { saveLastSession } = useLastSession();
  const lastSavedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const handleSessionSave = async () => {
      // Solo procesar cuando el usuario esté cargado completamente
      if (!isLoading && user) {
        // Verificar que tengamos la información necesaria
        if (user.id && user.email) {
          // Determinar el provider basado en la información de la sesión
          let provider = "credentials"; // default

          // Intentar determinar el provider basado en el avatar URL
          if (user.profile?.avatarUrl) {
            try {
              const imageUrl = new URL(user.profile.avatarUrl);
              if (imageUrl.hostname === "googleusercontent.com") {
                provider = "google";
              } else if (imageUrl.hostname === "cdn.discordapp.com") {
                provider = "discord";
              }
            } catch (e) {
              // If URL parsing fails, leave provider as "credentials"
              console.error("Error parsing user image URL:", e);
            }
          }

          // Solo guardar sesiones de OAuth (no credentials)
          if (provider !== "credentials") {
            const sessionKey = `${user.id}-${provider}`;

            // Evitar guardar la misma sesión múltiples veces
            if (lastSavedSessionRef.current !== sessionKey) {
              const displayName =
                user.profile?.displayName || user.email.split("@")[0];
              const sessionData = {
                userId: user.id,
                provider: provider,
                userDisplayName: getFirstName(displayName),
                userAvatarUrl: user.profile?.avatarUrl || undefined,
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
  }, [user, isLoading, saveLastSession]);
  return null;
};

export default SessionTracker;
