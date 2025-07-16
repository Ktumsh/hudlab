"use client";

import { IconUser } from "@tabler/icons-react";
import { motion, LayoutGroup } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navConfig } from "@/config/nav.config";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const PAGES_TO_HIDE = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

const AppFooter = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (PAGES_TO_HIDE.includes(pathname)) return null;

  const navigationDesktop = navConfig.mainNav;
  const navigationMobile = navConfig.bottomNav;

  if (isMobile) {
    return (
      <footer className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center">
        <nav className="bg-base-100 w-full border-t">
          <LayoutGroup>
            <ul className="flex items-center justify-between px-4">
              {navigationMobile.map((item, index) => {
                const isActive = item.href === pathname;
                const Icon = isActive ? item.iconFilled : item.icon;
                const isProfile = index === navigationMobile.length - 1;
                return (
                  <li
                    key={item.title}
                    className="relative flex flex-1 justify-center"
                  >
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={item.href ?? "/"}
                        className={cn(
                          "flex h-16 w-full flex-col items-center justify-center",
                          isActive && "text-primary-content",
                        )}
                      >
                        <span className="relative z-10 flex flex-col items-center">
                          {Icon && <Icon className="size-6" />}
                          {isProfile && (
                            <Avatar className="size-6">
                              <AvatarImage />
                              <AvatarFallback>
                                <IconUser className="size-3.5" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </span>
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </nav>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 z-50 mb-5 flex w-full">
      <nav className="bg-base-100/80 mx-auto rounded-[22px] border p-1.5 backdrop-blur">
        <LayoutGroup>
          <ul className="grid grid-cols-5 gap-2">
            {navigationDesktop.map((item, index) => {
              const isActive = item.href === pathname;
              const Icon = isActive ? item.iconFilled : item.icon;
              const isProfile = index === navigationDesktop.length - 1;
              return (
                <li key={item.title} className="relative">
                  <Button variant="ghost" asChild>
                    <Link
                      href={item.href ?? "/"}
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
                        {isProfile && (
                          <Avatar className="size-6">
                            <AvatarImage />
                            <AvatarFallback>
                              <IconUser className="size-3.5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-xs">{item.title}</span>
                      </span>
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </LayoutGroup>
      </nav>
    </footer>
  );
};

export default AppFooter;
