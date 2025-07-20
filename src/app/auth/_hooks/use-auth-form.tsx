"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthFormContextType {
  email: string;
  setEmail: (email: string) => void;
  step: number;
  setStep: (step: number) => void;
}

const AuthFormContext = createContext<AuthFormContextType | undefined>(
  undefined,
);

export const AuthFormProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>("");
  const [step, setStep] = useState<number>(1);

  return (
    <AuthFormContext.Provider value={{ email, setEmail, step, setStep }}>
      {children}
    </AuthFormContext.Provider>
  );
};

export const useAuthForm = () => {
  const context = useContext(AuthFormContext);
  if (!context) {
    throw new Error("useAuthForm must be used within a AuthFormProvider");
  }
  return context;
};
