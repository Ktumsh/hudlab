"use client";

import { useCallback, useEffect } from "react";

import { useIsMobile } from "./use-mobile";

interface UseInfiniteScrollOptions {
  disabled?: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  disabled = false,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const isMobile = useIsMobile();

  const handleScroll = useCallback(() => {
    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - window.innerHeight * (isMobile ? 4 : 3);

    if (nearBottom) onLoadMore();
  }, [isMobile, onLoadMore]);

  useEffect(() => {
    if (disabled) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [disabled, onLoadMore, handleScroll]);
}
