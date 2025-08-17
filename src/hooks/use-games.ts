import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import { Game } from "@/lib/types";

interface UseGamesOptions {
  search?: string;
  limit?: number;
}

interface GamesResponse {
  games: Game[];
  total: number;
}

export function useGames(options: UseGamesOptions = {}) {
  const { search, limit = 50 } = options;

  const searchParams = new URLSearchParams();
  if (search) searchParams.set("search", search);
  if (limit) searchParams.set("limit", limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/games${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GamesResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    games: data?.games || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

export function usePopularGames(limit: number = 10) {
  const { data, error, isLoading } = useSWR<GamesResponse>(
    `/api/games/popular?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    games: data?.games || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
}
