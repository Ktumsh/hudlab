import Image from "next/image";

import { cn } from "@/lib";

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size, className }: LogoProps) => {
  return (
    <Image
      priority
      src="/logo/HUDLab-logo.webp"
      alt="HUDLab Logo"
      width={size || 36}
      height={size || 36}
      className={cn("rounded-full", className)}
    />
  );
};

export default Logo;
