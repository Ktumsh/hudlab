"use client";

import { IconRestore, IconX } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { memo, useEffect, useState } from "react";

import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn, darkAppThemes, lightAppThemes } from "@/lib";

interface PersonalizationPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const defaultTheme = "black";

const PersonalizationPanel = ({ open, setOpen }: PersonalizationPanelProps) => {
  const isMobile = useIsMobile();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const onRestore = () => {
    setTheme(defaultTheme);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
      repositionInputs={false}
    >
      <DrawerContent>
        <DrawerHeader
          className={cn(
            !isMobile && "flex-row items-center justify-between border-b p-5",
          )}
        >
          <DrawerTitle
            className={cn(!isMobile && "p-0 text-lg leading-normal")}
          >
            Personalización
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Personaliza la apariencia de la interfaz de usuario.
          </DrawerDescription>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onRestore}>
              <IconRestore className="size-5" />
              <span className="sr-only">Restablecer</span>
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <IconX className="size-5" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="grow p-5">
          <p className="text-content-muted">Temas oscuros</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {darkAppThemes.map(({ dataTheme, label }) => (
              <button
                key={dataTheme}
                onClick={() => setTheme(dataTheme)}
                className="relative"
              >
                <ThemeBadge
                  dataTheme={dataTheme}
                  label={label}
                  currentTheme={theme}
                />
              </button>
            ))}
          </div>
          <p className="text-content-muted mt-6">Temas claros</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {lightAppThemes.map(({ dataTheme, label }) => (
              <button
                key={dataTheme}
                onClick={() => setTheme(dataTheme)}
                className="relative"
              >
                <ThemeBadge
                  dataTheme={dataTheme}
                  label={label}
                  currentTheme={theme}
                />
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PersonalizationPanel;

const ThemeBadge = memo(function ThemeBadge({
  currentTheme,
  dataTheme,
  label,
}: {
  currentTheme?: string;
  dataTheme: string;
  label: string;
}) {
  return (
    <div
      data-theme={dataTheme}
      className={cn(
        "rounded-box relative border-2 pt-5 pb-3",
        currentTheme === dataTheme && "border-primary",
      )}
    >
      <div className="mb-1.5 flex items-center justify-center gap-1">
        <div className="bg-base-content rounded-field h-6 w-4" />
        <div className="bg-primary rounded-field h-6 w-4" />
        <div className="bg-secondary rounded-field h-6 w-4" />
        <div className="bg-accent rounded-field h-6 w-4" />
      </div>
      <p className="text-sm font-medium">{label}</p>
      <div
        className={cn(
          "bg-primary invisible absolute top-2 right-2 size-2.5 shrink-0 rounded-full",
          currentTheme === dataTheme && "visible",
        )}
      />
    </div>
  );
});
