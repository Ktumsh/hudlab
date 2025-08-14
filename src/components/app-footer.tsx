"use client";

import { motion, LayoutGroup } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import UserAvatar from "./user-avatar";

import { navConfig } from "@/config/nav.config";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib";

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

  const { user, isLoading } = useUser();

  if (PAGES_TO_HIDE.includes(pathname)) return null;

  const navigationDesktop = navConfig.mainNav;
  const navigationMobile = navConfig.bottomNav;

  const filteredNavigationDesktop = user
    ? navigationDesktop
    : navigationDesktop.slice(0, 2);

  const filteredNavigationMobile = user
    ? navigationMobile.slice(0, -1)
    : navigationMobile.filter((_, idx) => idx !== 2 && idx !== 4);

  if (isLoading) {
    return (
      <>
        <footer className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center md:hidden">
          <nav className="bg-base-100 w-full border-t">
            <ul className="flex items-center justify-between px-4">
              {navigationMobile.slice(0, -1).map((_, idx) => (
                <li
                  key={idx}
                  className="relative flex h-14 flex-1 items-center justify-center"
                >
                  <Skeleton className="size-6 rounded-full" />
                </li>
              ))}
            </ul>
          </nav>
        </footer>

        <footer className="pointer-events-none fixed bottom-0 left-0 z-50 mb-5 hidden w-full md:flex">
          <nav className="bg-base-100/80 pointer-events-auto mx-auto max-w-[360px] rounded-[calc(var(--radius-field)+6px)] border p-1.5 backdrop-blur md:max-w-none">
            <ul className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <li key={idx}>
                  <Skeleton className="rounded-field h-14 w-20" />
                </li>
              ))}
            </ul>
          </nav>
        </footer>
      </>
    );
  }

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
                  className="relative flex h-14 flex-1 items-center justify-center"
                >
                  <Link
                    href={item.href ?? "/"}
                    scroll={false}
                    className={cn(
                      "flex h-14 w-full flex-col items-center justify-center",
                      isActive && "text-primary hover:text-primary",
                      isLast && "text-primary",
                    )}
                  >
                    <span className="relative z-10 flex flex-col items-center">
                      {Icon && (
                        <Icon className={cn("size-6", isLast && "size-7")} />
                      )}
                      {isProfile && (
                        <UserAvatar
                          profile={user?.profile}
                          className="size-6"
                        />
                      )}
                    </span>
                  </Link>
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
      <nav className="bg-base-100/80 pointer-events-auto mx-auto rounded-[calc(var(--radius-field)+6px)] border p-1.5 backdrop-blur">
        <LayoutGroup>
          <ul className={cn("grid grid-cols-5 gap-2", !user && "grid-cols-4")}>
            {filteredNavigationDesktop.map((item, index) => {
              const isActive = item.href === pathname;
              const Icon = isActive ? item.iconFilled : item.icon;
              const isProfile = index === navigationDesktop.length - 1;
              return (
                <li key={item.title} className="group relative">
                  <Link
                    href={item.href ?? ""}
                    scroll={false}
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                      }),
                      "flex h-14 w-20 flex-col items-center gap-1 border-0 p-1.5 hover:bg-transparent!",
                      isActive && "text-primary hover:text-primary",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavItem"
                        className="rounded-field bg-base-300 group-hover:bg-base-200 absolute inset-0 z-0 transition-colors"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex flex-col items-center">
                      {Icon && <Icon className="size-6" />}
                      {isProfile && (
                        <UserAvatar
                          profile={user?.profile}
                          className="size-6"
                        />
                      )}
                      <span className="text-xs">{item.title}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {!user && (
              <li className="col-span-2 grid gap-2">
                <Link
                  href={`/auth/login?next=${pathname}`}
                  className={buttonVariants({
                    variant: "ghost",
                    className:
                      "bg-base-200 hover:bg-base-300 text-neutral-content h-auto rounded-b-sm",
                  })}
                >
                  <span className="text-xs">Iniciar sesión</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className={buttonVariants({
                    variant: "primary",
                    className: "h-auto rounded-t-sm",
                  })}
                >
                  <span className="text-xs">Registrarse</span>
                </Link>
              </li>
            )}
          </ul>
        </LayoutGroup>
      </nav>
    </footer>
  );
};

export default AppFooter;
