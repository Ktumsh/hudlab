"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";

import { isProductionEnvironment } from "@/lib";

interface LastSession {
  userId: string;
  provider: string;
  userDisplayName: string;
  userEmail: string;
  userAvatarUrl?: string;
  lastUsedAt: Date;
}

interface LastSessionContextType {
  lastSession: LastSession | null;
  isLoading: boolean;
  hasValidSession: boolean;
  saveLastSession: (
    sessionData: Omit<LastSession, "lastUsedAt">,
  ) => Promise<void>;
  clearLastSession: () => void;
  clearSpecificSession: (userId: string, provider: string) => void;
}

const LastSessionContext = createContext<LastSessionContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "hudlab-last-session";

// Función para obtener datos del localStorage de forma segura
const getStoredLastSession = (): LastSession | null => {
  try {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Validar que tenga la estructura correcta
    if (!parsed.userId || !parsed.provider || !parsed.userDisplayName) {
      return null;
    }

    // Verificar que no esté expirada (30 días en prod, 7 en dev)
    const maxAge = isProductionEnvironment ? 30 : 7;
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - maxAgeMs;
    const sessionTime = new Date(parsed.lastUsedAt).getTime();

    if (sessionTime < cutoffTime) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      ...parsed,
      lastUsedAt: new Date(parsed.lastUsedAt),
    };
  } catch (error) {
    console.error("Error reading stored session:", error);
    // Limpiar datos corruptos
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }
};

// Función para guardar en localStorage
const setStoredLastSession = (session: LastSession): void => {
  try {
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error storing session:", error);
  }
};

// Función para limpiar el localStorage
const clearStoredLastSession = (): void => {
  try {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing stored session:", error);
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
        const storedSession = getStoredLastSession();
        setLastSession(storedSession);

        if (!isProductionEnvironment && storedSession) {
          console.log("Loaded last session from localStorage:", storedSession);
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
    async (sessionData: Omit<LastSession, "lastUsedAt">) => {
      try {
        const newSession: LastSession = {
          ...sessionData,
          lastUsedAt: new Date(),
        };

        setStoredLastSession(newSession);
        setLastSession(newSession);

        if (!isProductionEnvironment) {
          console.log("Last session saved to localStorage:", newSession);
        }
      } catch (error) {
        console.error("Error saving last session:", error);
      }
    },
    [],
  );

  const clearLastSession = useCallback(() => {
    try {
      clearStoredLastSession();
      setLastSession(null);

      if (!isProductionEnvironment) {
        console.log("Last session cleared from localStorage");
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

  const value: LastSessionContextType = useMemo(
    () => ({
      lastSession,
      isLoading,
      saveLastSession,
      clearLastSession,
      clearSpecificSession,
      hasValidSession,
    }),
    [
      lastSession,
      isLoading,
      saveLastSession,
      clearLastSession,
      clearSpecificSession,
      hasValidSession,
    ],
  );

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
