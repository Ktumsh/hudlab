"use client";

import { useEffect, useState } from "react";

interface FeedGradientProps {
  className?: string;
}

const FeedGradient = ({ className }: FeedGradientProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Si el usuario está cerca del final, ocultar el gradiente
      if (scrollY + windowHeight >= docHeight - 32) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={
        className ||
        "to-base-100 pointer-events-none fixed inset-0 z-1 bg-gradient-to-b from-transparent from-80%"
      }
    />
  );
};

export default FeedGradient;
