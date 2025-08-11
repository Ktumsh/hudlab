"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import type { UserWithProfile } from "@/lib/types";

import { apiUrl, fetcher } from "@/lib";

interface AuthContextType {
  user: UserWithProfile | null;
  error: Error | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithOAuth: (provider: "google" | "discord") => Promise<void>;
  signUp: (data: SignUpData) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authFetcher = (url: string) =>
  fetcher<UserWithProfile | null>(url, { noStore: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    data: user,
    error,
    isValidating,
    isLoading: swrIsLoading,
    mutate,
  } = useSWR<UserWithProfile | null>("/api/user", authFetcher, {
    revalidateOnFocus: false,
    fallbackData: null,
    errorRetryCount: 0,
  });

  const isLoading = isValidating || swrIsLoading;

  // Sincroniza cookie espejo ligera para middleware (cross-domain workaround)
  useEffect(() => {
    const syncMirror = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/session-mirror`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.authenticated && data.token) {
          // token contiene HMAC; además generamos cookie legible: uid:username:exp (5 min)
          const exp = Date.now() + 5 * 60 * 1000;
          // guardamos dos cookies: espejo simple (para parse rápido) y firma (opcional futuro)
          document.cookie = `hudlab_auth_simple=${data.username || ""}:${exp}; Path=/; Max-Age=300; SameSite=Lax`;
          document.cookie = `hudlab_auth=${data.token}:${exp}; Path=/; Max-Age=300; SameSite=Lax`;
        } else {
          // borrar cookie
          document.cookie = "hudlab_auth=; Path=/; Max-Age=0";
          document.cookie = "hudlab_auth_simple=; Path=/; Max-Age=0";
        }
      } catch {
        /* ignore */
      }
    };
    // Ejecutar al montar y cada vez que cambia el id de usuario
    syncMirror();
    const id = setInterval(syncMirror, 120000); // refresco cada 2min
    return () => clearInterval(id);
  }, [user?.id]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.type === "success") {
        await mutate(); // trigger fetch user
        // Mirror cookie se actualizará por efecto
        toast.success(data.message || "Sesión iniciada correctamente");
        return true;
      } else {
        toast.error(data.message || "Error al iniciar sesión");
        return false;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Error de conexión");
      return false;
    }
  };

  const getCsrfToken = async (): Promise<string> => {
    const response = await fetch(`${apiUrl}/api/auth/csrf`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener el token CSRF");
    }

    const { csrfToken } = await response.json();
    return csrfToken;
  };

  const signInWithOAuth = async (
    provider: "google" | "discord",
  ): Promise<void> => {
    try {
      // Obtener token CSRF
      const csrfToken = await getCsrfToken();

      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${apiUrl}/api/auth/signin/${provider}`;

      // Agregar campos del form
      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "csrfToken";
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      const callbackInput = document.createElement("input");
      callbackInput.type = "hidden";
      callbackInput.name = "callbackUrl";
      callbackInput.value = `${window.location.origin}/feed`;
      form.appendChild(callbackInput);

      // Enviar el form
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error durante el inicio de sesión OAuth:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al iniciar sesión con ${provider}: ${errorMessage}`);
      throw error;
    }
  };

  const signUp = async (data: SignUpData): Promise<boolean> => {
    try {
      const response = await fetch(`${apiUrl}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Cuenta creada exitosamente");
        return true;
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al crear cuenta");
        return false;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Error de conexión");
      return false;
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${apiUrl}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/auth/login");
      mutate(null);
      // Limpieza inmediata cookies espejo
      document.cookie = "hudlab_auth=; Path=/; Max-Age=0";
      document.cookie = "hudlab_auth_simple=; Path=/; Max-Age=0";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const refreshUser = async () => {
    await mutate();
  };

  const value = {
    user: user ?? null,
    isLoading,
    error,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
