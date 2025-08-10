"use client";

import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib";

const ProfileTabs = ({ username }: { username: string }) => {
  const pathname = usePathname();
  const isHuds =
    pathname?.endsWith(`/${username}`) ||
    pathname?.includes(`/${username}/huds`);
  const isCollections = pathname?.includes(`/${username}/collections`);

  return (
    <div className="border-border-muted mb-5 flex justify-center border-b">
      <LayoutGroup>
        <div className="group grid grid-cols-2 gap-0.5">
          <Link
            href={`/${username}/huds`}
            scroll={false}
            className={cn(
              "relative flex h-9 flex-1 items-center justify-center px-4 font-semibold",
              isHuds && "text-primary",
            )}
          >
            {isHuds && (
              <motion.div
                layoutId="active-profile-button"
                className="border-primary absolute inset-0 z-0 border-b-2 transition-colors"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-1">HUDs</span>
          </Link>
          <Link
            href={`/${username}/collections`}
            scroll={false}
            className={cn(
              "relative flex h-9 flex-1 items-center justify-center px-4 font-semibold",
              isCollections && "text-primary",
            )}
          >
            {isCollections && (
              <motion.div
                layoutId="active-profile-button"
                className="border-primary absolute inset-0 z-0 border-b-2 transition-colors"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-1">Colecciones</span>
          </Link>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default ProfileTabs;
