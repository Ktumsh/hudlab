"use client";

import { IconFingerprint, IconLogout, IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { useUser } from "@/hooks/use-user";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./user-avatar";

const UserOptions = () => {
  const pathname = usePathname();

  const { user } = useUser();

  if (!user) {
    return (
      <>
        <Button asChild>
          <Link href={`/auth/login?next=${pathname}`}>Iniciar sesión</Link>
        </Button>
        <Button variant="primary" asChild>
          <Link href="/auth/signup">Registrarse</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          outline
          size="icon"
          className="outline-content-muted bg-base-200 rounded-full border-0 outline-2 outline-offset-2"
        >
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.profile.displayName}
              </span>
              <span className="text-content-muted truncate text-xs">
                {user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconFingerprint />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconSettings />
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => signOut({ redirectTo: "/auth/login" })}
        >
          <IconLogout />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserOptions;
