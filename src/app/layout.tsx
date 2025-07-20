import "./globals.css";

import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { inter } from "@/config/font.config";
import { metadataConfig } from "@/config/metadata.config";
import {
  getFilterOptions,
  getSearchSuggestions,
} from "@/db/querys/filter-querys";
import { cn } from "@/lib";

import SessionTracker from "./auth/_components/session-tracker";

import type { Viewport } from "next";

export const metadata = metadataConfig;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff" },
    { media: "(prefers-color-scheme: dark)", color: "#000" },
  ],
  colorScheme: "light dark",
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const filterOptions = getFilterOptions();
  const suggestions = getSearchSuggestions();

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(inter.variable, "antialiased")}>
        <Providers>
          <SessionTracker />
          <AppHeader
            filterOptionsPromise={filterOptions}
            suggestionsPromise={suggestions}
          />
          {children}
          <AppFooter />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
