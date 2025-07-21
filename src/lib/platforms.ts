import {
  IconBrandApple,
  IconDeviceGamepad2,
  IconDeviceDesktop,
  IconWorld,
} from "@tabler/icons-react";

import {
  PlayStation,
  Xbox,
  MacOS,
  IOS,
  Windows,
  Android,
  GameBoy,
  Nintendo,
  NintendoSwitch,
  Wii,
  WiiU,
  Linux,
  Atari,
  GameCube,
  Sega,
} from "@/components/icons/platforms";

export const PLATFORM_ICONS = {
  // Clásicos
  "3DO": IconDeviceGamepad2,
  "Apple II": IconBrandApple,
  "Atari 2600": Atari,
  "Atari 5200": Atari,
  "Atari 7800": Atari,
  "Atari 8-bit": Atari,
  "Atari Lynx": IconDeviceGamepad2,
  "Atari ST": Atari,
  "Atari XEGS": Atari,
  "Classic Macintosh": MacOS,
  "Commodore / Amiga": IconDeviceDesktop,

  // SEGA
  Dreamcast: Sega,
  Genesis: Sega,
  "SEGA 32X": Sega,
  "SEGA CD": Sega,
  "SEGA Master System": Sega,
  "SEGA Saturn": Sega,
  "Game Gear": IconDeviceGamepad2,

  // Nintendo Portátiles
  "Game Boy": GameBoy,
  "Game Boy Advance": GameBoy,
  "Game Boy Color": GameBoy,
  "Nintendo 3DS": Nintendo,
  "Nintendo DS": Nintendo,
  "Nintendo DSi": Nintendo,

  // Nintendo Consolas
  GameCube: GameCube,
  NES: Nintendo,
  "Nintendo 64": Nintendo,
  "Nintendo Switch": NintendoSwitch,
  SNES: Nintendo,
  Wii: Wii,
  "Wii U": WiiU,

  // Sony
  PlayStation: PlayStation,
  "PlayStation 2": PlayStation,
  "PlayStation 3": PlayStation,
  "PlayStation 4": PlayStation,
  "PlayStation 5": PlayStation,
  PSP: PlayStation,
  "PS Vita": PlayStation,

  // Microsoft
  Xbox: Xbox,
  "Xbox 360": Xbox,
  "Xbox One": Xbox,
  "Xbox Series S/X": Xbox,

  // PC/Mobile
  PC: Windows,
  Windows: Windows,
  Linux: Linux,
  macOS: MacOS,
  Android: Android,
  iOS: IOS,

  // Web/Other
  Web: IconWorld,
  "Neo Geo": IconDeviceGamepad2,
  Jaguar: IconDeviceGamepad2,
} as const;

export type PlatformName = keyof typeof PLATFORM_ICONS;

export const getPlatformIcon = (platformName: string) => {
  // Normalizar el nombre de la plataforma
  const normalized = platformName.trim() as PlatformName;
  return PLATFORM_ICONS[normalized] || IconDeviceGamepad2;
};

export const parsePlatforms = (
  platforms: string,
): Array<{ name: string; Icon: any }> => {
  if (!platforms) return [];

  return platforms
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((platform) => ({
      name: platform,
      Icon: getPlatformIcon(platform),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
