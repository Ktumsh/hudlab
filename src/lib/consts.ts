export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = process.env.NODE_ENV === "test";

export const brevoKey = process.env.BREVO_API_KEY;

export const localUrl = "http://localhost:3000";
export const productionUrl = "https://hudlab.vercel.app";
export const localApiUrl = "http://localhost:3001";
export const productionApiUrl = "https://api-hudlab.vercel.app";

export const siteUrl = isDevelopmentEnvironment ? localUrl : productionUrl;
export const apiUrl = isDevelopmentEnvironment ? localApiUrl : productionApiUrl;

export const GAME_GENRE_MAP: Record<string, string> = {
  Action: "Acción",
  Adventure: "Aventura",
  Arcade: "Arcade",
  "Board Games": "Juegos de mesa",
  Card: "Cartas",
  Casual: "Casual",
  Educational: "Educativo",
  Family: "Familiar",
  Fighting: "Lucha",
  Indie: "Indie",
  "Massively Multiplayer": "Multijugador masivo",
  Platformer: "Plataformas",
  Puzzle: "Puzzle",
  RPG: "Rol (RPG)",
  Racing: "Carreras",
  Shooter: "Disparos",
  Simulation: "Simulación",
  Sports: "Deportes",
  Strategy: "Estrategia",
};
import { FilterState } from "@/lib/types";

export const DEFAULT_FILTERS: FilterState = {
  searchText: "",
  tags: [],
  platform: "none",
  releaseYear: "none",
  inMyCollections: false,
  sortBy: "newest",
};

export const defaultAppTheme = "black";

export const darkAppThemes = [
  { dataTheme: "black", label: "Default" },
  { dataTheme: "cyberpunk", label: "Cyberpunk" },
  { dataTheme: "neonwave", label: "Neon Wave" },
  { dataTheme: "darkmatter", label: "Dark Matter" },
  { dataTheme: "glitch", label: "Glitch" },
  { dataTheme: "midnight", label: "Midnight" },
];

export const lightAppThemes = [
  { dataTheme: "pixelart", label: "Pixel Art" },
  { dataTheme: "vaporwave", label: "Vaporwave" },
  { dataTheme: "steampunk", label: "Steampunk" },
  { dataTheme: "zenith", label: "Zenith" },
  { dataTheme: "cotton", label: "Cotton" },
  { dataTheme: "sage", label: "Sage" },
];
