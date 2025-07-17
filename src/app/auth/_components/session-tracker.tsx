"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { useLastSessionManager } from "../_hooks/use-last-session";

/**
 * Componente para manejar automáticamente el guardado de sesiones
 * cuando el usuario inicia sesión exitosamente
 */
const SessionTracker = () => {
  const { data: session, status } = useSession();
  const { saveLastSession } = useLastSessionManager();
  const lastSavedSessionRef = useRef<string | null>(null);

  useEffect(() => {
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
            const sessionData = {
              userId: user.id,
              provider: provider,
              userDisplayName: user.name || user.email.split("@")[0],
              userAvatarUrl: user.image || undefined,
            };

            saveLastSession(sessionData);
            lastSavedSessionRef.current = sessionKey;
          }
        }
      }
    }
  }, [session, status, saveLastSession]); // Este componente no renderiza nada visible
  return null;
};

export default SessionTracker;
