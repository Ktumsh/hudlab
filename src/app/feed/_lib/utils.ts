import { GAME_GENRE_MAP } from "@/lib/consts";

export function getTranslatedGenres(genres: string): string[] {
  if (!genres) return [];
  return genres.split(",").map((g) => {
    const genre = g.trim();
    return GAME_GENRE_MAP[genre] || genre;
  });
}
