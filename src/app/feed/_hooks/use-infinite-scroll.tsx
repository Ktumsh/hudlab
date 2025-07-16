"use client";

import { useEffect } from "react";

interface UseInfiniteScrollOptions {
  disabled?: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  disabled = false,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - window.innerHeight * 2.5;

      if (nearBottom) onLoadMore();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [disabled, onLoadMore]);
}
