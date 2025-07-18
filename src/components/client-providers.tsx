"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { FilterProvider } from "@/hooks/use-filters";
import { LastSessionProvider } from "@/hooks/use-last-session";

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="black"
        enableSystem={false}
      >
        <LastSessionProvider>
          <FilterProvider>{children}</FilterProvider>
        </LastSessionProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default ClientProviders;
