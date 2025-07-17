import Image from "next/image";

import { cn } from "@/lib";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo = ({ width, height, className }: LogoProps) => {
  return (
    <Image
      priority
      src="/logo/HUDLab-logo.webp"
      alt="HUDLab Logo"
      width={width || 36}
      height={height || 36}
      className={cn("rounded-full", className)}
    />
  );
};

export default Logo;
