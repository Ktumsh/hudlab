"use client";

import { IconRestore, IconTextSize, IconX } from "@tabler/icons-react";
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
import {
  Typography,
  usePreferences,
  type FontSize,
} from "@/hooks/use-preferences";
import { cn, darkAppThemes, lightAppThemes } from "@/lib";

interface PersonalizationPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const defaultTheme = "black";

const fontSizeMap = {
  small: "Pequeño",
  medium: "Mediano",
  large: "Grande",
};

const typographyMap = {
  label: {
    default: "Inter",
    merriweather: "Merriweather",
    exo2: "Exo 2",
    "jetbrains-mono": "JetBrains Mono",
  },
  description: {
    default: "Por defecto",
    merriweather: "Elegante",
    exo2: "Futurista",
    "jetbrains-mono": "Monoespaciada",
  },
  font: {
    default: "font-inter",
    merriweather: "font-merriweather",
    exo2: "font-exo2",
    "jetbrains-mono": "font-jetbrains-mono",
  },
};

const PersonalizationPanel = ({ open, setOpen }: PersonalizationPanelProps) => {
  const isMobile = useIsMobile();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { settings, updateFontSize, updateTypography, resetSettings } =
    usePreferences();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const onRestore = () => {
    setTheme(defaultTheme);
    resetSettings();
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
        <div className="grow space-y-6 p-5">
          <div className="space-y-3">
            <p className="text-content-muted text-sm">Temas oscuros</p>
            <div className="grid grid-cols-3 gap-3">
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
          </div>
          <div className="space-y-3">
            <p className="text-content-muted text-sm">Temas claros</p>
            <div className="grid grid-cols-3 gap-3">
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
          <div className="space-y-3">
            <p className="text-content-muted text-sm">Tamaño de fuente</p>
            <div className="grid grid-cols-3 items-end gap-3">
              {Object.entries(fontSizeMap).map(([value]) => (
                <button
                  key={value}
                  onClick={() => updateFontSize(value as FontSize)}
                  className="relative h-fit"
                >
                  <FontSizeBadge
                    currentFontSize={settings.fontSize}
                    fontSize={value as FontSize}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-content-muted text-sm">Tipografía</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(typographyMap.label).map(([value]) => (
                <button
                  key={value}
                  onClick={() => updateTypography(value as Typography)}
                  className="relative"
                >
                  <TypographyBadge
                    currentTypography={settings.typography}
                    typography={value as Typography}
                  />
                </button>
              ))}
            </div>
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
        "rounded-box relative border-2 pt-4 pb-2",
        currentTheme === dataTheme && "border-primary",
      )}
    >
      <div className="mb-1.5 flex items-center justify-center gap-1">
        <div className="bg-base-content rounded-field h-6 w-4" />
        <div className="bg-primary rounded-field h-6 w-4" />
        <div className="bg-neutral rounded-field h-6 w-4" />
        <div className="bg-accent rounded-field h-6 w-4" />
      </div>
      <p className="text-xs font-medium">{label}</p>
      <div
        className={cn(
          "bg-primary invisible absolute top-2 right-2 size-2.5 shrink-0 rounded-full",
          currentTheme === dataTheme && "visible",
        )}
      />
    </div>
  );
});

const FontSizeBadge = memo(function FontSizeBadge({
  currentFontSize,
  fontSize,
}: {
  currentFontSize?: FontSize;
  fontSize: FontSize;
}) {
  const label = fontSizeMap[fontSize];
  const small = fontSize === "small";
  const large = fontSize === "large";
  return (
    <div
      data-font-size={fontSize}
      className={cn(
        "rounded-box relative border-2 pt-3 pb-2",
        currentFontSize === fontSize && "border-primary",
      )}
    >
      <div className="mb-1.5 flex items-center justify-center gap-1">
        <IconTextSize
          className={cn(
            "text-base-content size-5",
            small && "size-4",
            large && "size-6",
          )}
        />
      </div>
      <p
        className="font-medium"
        style={{ fontSize: small ? "12px" : large ? "16px" : "14px" }}
      >
        {label}
      </p>
      <div
        className={cn(
          "bg-primary invisible absolute top-2 right-2 size-2.5 shrink-0 rounded-full",
          currentFontSize === fontSize && "visible",
        )}
      />
    </div>
  );
});

const TypographyBadge = memo(function TypographyBadge({
  currentTypography,
  typography,
}: {
  currentTypography?: Typography;
  typography: Typography;
}) {
  const label = typographyMap.label[typography];
  const description = typographyMap.description[typography];
  const fontFamily = typographyMap.font[typography];

  return (
    <div
      data-typography={typography}
      className={cn(
        "rounded-box relative border-2 py-3",
        currentTypography === typography && "border-primary",
        fontFamily,
      )}
    >
      <div className="mb-1.5 flex items-center justify-center gap-1">
        <span className="text-base-content">{description}</span>
      </div>
      <p className="text-content-muted text-xs font-medium">{label}</p>
      <div
        className={cn(
          "bg-primary invisible absolute top-2 right-2 size-2.5 shrink-0 rounded-full",
          currentTypography === typography && "visible",
        )}
      />
    </div>
  );
});
