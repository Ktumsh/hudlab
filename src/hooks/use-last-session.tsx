"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const useLastSessionManager = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      // Guardar última sesión en localStorage
      const lastSessionData = {
        userId: session.user.id,
        provider: "google", // TODO: Obtener el provider real de la sesión
        userDisplayName:
          session.user.name || session.user.email?.split("@")[0] || "Usuario",
        userAvatarUrl: session.user.image,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        "hudlab_last_session",
        JSON.stringify(lastSessionData),
      );
    }
  }, [session]);
};

export default useLastSessionManager;
