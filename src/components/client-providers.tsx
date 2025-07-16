"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { FilterProvider } from "@/hooks/use-filters";

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="black"
        enableSystem={false}
      >
        <FilterProvider>{children}</FilterProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default ClientProviders;
