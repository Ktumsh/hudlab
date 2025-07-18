"use client";

import { useEffect, useRef, useState } from "react";

export function useForceHover() {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let rafId: number;

    const updateHoverState = () => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (isInViewport) {
        element.style.pointerEvents = "auto";
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      updateHoverState();
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const handleScroll = () => {
      rafId = requestAnimationFrame(updateHoverState);
    };

    const handleMouseMove = () => {
      updateHoverState();
    };

    element.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    element.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    element.addEventListener("mousemove", handleMouseMove, { passive: true });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);

      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return { elementRef, isHovered };
}
