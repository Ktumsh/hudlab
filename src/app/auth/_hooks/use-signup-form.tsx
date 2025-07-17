"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SignupFormContextType {
  email: string;
  setEmail: (email: string) => void;
  step: number;
  setStep: (step: number) => void;
}

const SignupFormContext = createContext<SignupFormContextType | undefined>(
  undefined,
);

export const SignupFormProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>("");
  const [step, setStep] = useState<number>(1);

  return (
    <SignupFormContext.Provider value={{ email, setEmail, step, setStep }}>
      {children}
    </SignupFormContext.Provider>
  );
};

export const useSignupForm = () => {
  const context = useContext(SignupFormContext);
  if (!context) {
    throw new Error("useSignupForm must be used within a SignupFormProvider");
  }
  return context;
};
