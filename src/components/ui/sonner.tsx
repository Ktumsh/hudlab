"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--border-radius": "var(--radius-box)",
          "--normal-bg": "var(--color-base-100)",
          "--normal-text": "var(--color-base-content)",
          "--normal-border": "var(--color-base-200)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
