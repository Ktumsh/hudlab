"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import type { UserWithProfile } from "@/lib/types";

interface UserContextType {
  user: UserWithProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserWithProfile | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  initialUserData: UserWithProfile | null;
  children: ReactNode;
}

export const UserProvider = ({
  initialUserData,
  children,
}: UserProviderProps) => {
  const [user, setUser] = useState<UserWithProfile | null>(initialUserData);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
