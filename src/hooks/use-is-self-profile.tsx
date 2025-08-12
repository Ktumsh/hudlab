"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

interface IsSelfProfileContextValue {
  isSelfProfile: boolean;
}

const IsSelfProfileContext = createContext<
  IsSelfProfileContextValue | undefined
>(undefined);

export function IsSelfProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isSelfProfile = useMemo(() => {
    return pathname?.startsWith("/me/") || pathname === "/me";
  }, [pathname]);

  return (
    <IsSelfProfileContext.Provider value={{ isSelfProfile }}>
      {children}
    </IsSelfProfileContext.Provider>
  );
}

export function useIsSelfProfile() {
  const context = useContext(IsSelfProfileContext);
  if (!context) {
    throw new Error(
      "useIsSelfProfile must be used within an IsSelfProfileProvider",
    );
  }
  return context.isSelfProfile;
}
