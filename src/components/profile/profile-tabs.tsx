"use client";

import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib";

interface ProfileTabsProps {
  username: string;
  basePath?: string; // allows "/me" vs "/:username"
}

const ProfileTabs = ({ username, basePath }: ProfileTabsProps) => {
  const pathname = usePathname();
  const root = basePath ? `${basePath}` : `/${username}`;
  const hudsPath = `${root}/huds`;
  const collectionsPath = `${root}/collections`;
  const isHuds = pathname === hudsPath || pathname?.startsWith(`${hudsPath}`);
  const isCollections =
    pathname === collectionsPath || pathname?.startsWith(`${collectionsPath}`);

  return (
    <div className="mb-5 flex justify-center md:border-b">
      <LayoutGroup>
        <div className="group grid grid-cols-2 gap-0.5">
          <Link
            href={hudsPath}
            scroll={false}
            className={cn(
              "relative flex h-9 flex-1 items-center justify-center px-4 text-sm font-semibold md:text-base",
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
            href={collectionsPath}
            scroll={false}
            className={cn(
              "relative flex h-9 flex-1 items-center justify-center px-4 text-sm font-semibold md:text-base",
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
