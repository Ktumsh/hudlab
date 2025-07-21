"use client";

import { useEffect, useState } from "react";

export const useIsMac = () => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Detección más robusta de Mac
    const checkIsMac = () => {
      return (
        navigator.userAgent.includes("Macintosh") ||
        navigator.userAgent.includes("Mac OS") ||
        navigator.platform.includes("Mac") ||
        // Para compatibilidad con navegadores más antiguos
        /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
      );
    };

    setIsMac(checkIsMac());
  }, []);

  return isMac;
};
