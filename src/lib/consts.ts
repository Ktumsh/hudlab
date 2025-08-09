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

// Eliminado: aspectRatios ya no se utiliza; manejamos altura fija en skeletons
