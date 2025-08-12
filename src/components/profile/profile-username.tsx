import Logo from "../logo";

import { cn } from "@/lib";

interface ProfileUsernameProps {
  username: string;
  className?: string;
  logoSize?: number;
  logoClassName?: string;
}

const ProfileUsername = ({
  username,
  className,
  logoSize = 18,
  logoClassName,
}: ProfileUsernameProps) => {
  return (
    <span className={cn("text-content-muted text-sm", className)}>
      <Logo
        size={logoSize}
        className={cn("mr-1 inline size-4.5 grayscale-100", logoClassName)}
      />
      {username}
    </span>
  );
};

export default ProfileUsername;
