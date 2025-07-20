"use client";

import { motion, LayoutGroup } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navConfig } from "@/config/nav.config";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib";

import { Button } from "./ui/button";
import UserAvatar from "./user-avatar";

const PAGES_TO_HIDE = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/account-deleted",
];

const AppFooter = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { user } = useUser();

  if (PAGES_TO_HIDE.includes(pathname)) return null;

  const navigationDesktop = navConfig.mainNav;
  const navigationMobile = navConfig.bottomNav;

  const slicedNavigationDesktop = user
    ? navigationDesktop
    : navigationDesktop.slice(0, 2);

  const filteredNavigationMobile = user
    ? navigationMobile.slice(0, -1)
    : navigationMobile.filter((_, idx) => idx !== 2 && idx !== 4);

  if (isMobile) {
    return (
      <footer className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center">
        <nav className="bg-base-100 w-full border-t">
          <ul className="flex items-center justify-between px-4">
            {filteredNavigationMobile.map((item, index) => {
              const isActive = item.href === pathname;
              const Icon = isActive ? item.iconFilled : item.icon;
              const isProfile = index === 4;
              const isLast = index === filteredNavigationMobile.length - 1;
              return (
                <li
                  key={item.title}
                  className="relative flex h-16 flex-1 items-center justify-center"
                >
                  <Button variant="ghost" size="icon" asChild>
                    <Link
                      href={item.href ?? "/"}
                      className={cn(
                        "flex h-14 w-full flex-col items-center justify-center",
                        isActive && "text-white",
                        isLast && "text-primary",
                      )}
                    >
                      <span className="relative z-10 flex flex-col items-center">
                        {Icon && (
                          <Icon className={cn("size-6", isLast && "size-7")} />
                        )}
                        {isProfile && <UserAvatar className="size-6" />}
                      </span>
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </footer>
    );
  }

  return (
    <footer className="pointer-events-none fixed bottom-0 left-0 z-50 mb-5 flex w-full">
      <nav className="bg-base-100/80 pointer-events-auto mx-auto rounded-[22px] border p-1.5 backdrop-blur">
        <LayoutGroup>
          <ul className={cn("grid grid-cols-5 gap-2", !user && "grid-cols-4")}>
            {slicedNavigationDesktop.map((item, index) => {
              const isActive = item.href === pathname;
              const Icon = isActive ? item.iconFilled : item.icon;
              const isProfile = index === navigationDesktop.length - 1;
              return (
                <li key={item.title} className="relative">
                  <Button variant="ghost" asChild>
                    <Link
                      href={
                        isProfile
                          ? `/${user?.profile.username}`
                          : (item.href ?? "")
                      }
                      className={cn(
                        "rounded-box flex h-14 w-20 flex-col items-center gap-1 border-0 p-1.5 hover:bg-transparent!",
                        isActive && "text-white",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNavItem"
                          className="rounded-box bg-base-200 hover:bg-base-300 absolute inset-0 z-0 transition-colors"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex flex-col items-center">
                        {Icon && <Icon className="size-6" />}
                        {isProfile && <UserAvatar className="size-6" />}
                        <span className="text-xs">{item.title}</span>
                      </span>
                    </Link>
                  </Button>
                </li>
              );
            })}
            {!user && (
              <li className="col-span-2 grid gap-2">
                <Button
                  asChild
                  className="bg-base-200 hover:bg-base-300 text-neutral-content h-auto rounded-b-sm"
                >
                  <Link href={`/auth/login?next=${pathname}`}>
                    <span className="text-xs">Iniciar sesión</span>
                  </Link>
                </Button>
                <Button
                  variant="primary"
                  asChild
                  className="h-auto rounded-t-sm"
                >
                  <Link href="/auth/signup">
                    <span className="text-xs">Registrarse</span>
                  </Link>
                </Button>
              </li>
            )}
          </ul>
        </LayoutGroup>
      </nav>
    </footer>
  );
};

export default AppFooter;
