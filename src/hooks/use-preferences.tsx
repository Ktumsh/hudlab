"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

export type FontSize = "small" | "medium" | "large";
export type Typography = "default" | "merriweather" | "exo2" | "jetbrains-mono";

interface PreferencesSettings {
  fontSize: FontSize;
  typography: Typography;
  reduceMotion: boolean;
}

interface PreferencesContextType {
  settings: PreferencesSettings;
  updateFontSize: (fontSize: FontSize) => void;
  updateTypography: (typography: Typography) => void;
  updateReduceMotion: (reduceMotion: boolean) => void;
  updateSetting: <K extends keyof PreferencesSettings>(
    key: K,
    value: PreferencesSettings[K],
  ) => void;
  resetSettings: () => void;
}

const defaultSettings: PreferencesSettings = {
  fontSize: "medium",
  typography: "default",
  reduceMotion: false,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<PreferencesSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useLayoutEffect(() => {
    const savedSettings = localStorage.getItem("hudlab-preferences");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Error loading Preferences settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("hudlab-preferences", JSON.stringify(settings));

    if (settings.fontSize === "medium") {
      document.body.removeAttribute("data-fs");
    } else {
      document.body.setAttribute("data-fs", settings.fontSize);
    }

    if (settings.typography === "default") {
      document.body.removeAttribute("data-typography");
    } else {
      document.body.setAttribute("data-typography", settings.typography);
    }
  }, [settings]);

  const updateFontSize = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  const updateTypography = (typography: Typography) => {
    setSettings((prev) => ({ ...prev, typography }));
  };

  const updateReduceMotion = (reduceMotion: boolean) => {
    setSettings((prev) => ({ ...prev, reduceMotion }));
  };

  const updateSetting = <K extends keyof PreferencesSettings>(
    key: K,
    value: PreferencesSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <PreferencesContext.Provider
      value={{
        settings,
        updateFontSize,
        updateTypography,
        updateReduceMotion,
        updateSetting,
        resetSettings,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
