"use client";

import { createContext, useContext, ReactNode } from "react";

import { useAuth } from "./use-auth";

import type { UserWithProfile } from "@/lib/types";

interface UserContextType {
  user: UserWithProfile | undefined;
  isLoading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { user, isLoading, error } = useAuth();

  return (
    <UserContext.Provider value={{ user: user || undefined, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe usarse dentro de un UserProvider");
  }
  return context;
};
