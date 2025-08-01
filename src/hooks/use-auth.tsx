"use client";

import { createContext, useContext } from "react";
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
  const {
    data: user,
    error,
    isValidating,
    isLoading: swrIsLoading,
    mutate,
  } = useSWR<UserWithProfile | null>("/api/user", authFetcher);

  const isLoading = isValidating || swrIsLoading;

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
        await mutate();
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

      // En lugar de usar fetch con redirect manual, vamos a usar el approach directo
      // Crear un form temporal y enviarlo para que el navegador maneje la redirección naturalmente
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
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      mutate(null);
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
