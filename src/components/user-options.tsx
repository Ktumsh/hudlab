"use client";

import {
  IconBell,
  IconFingerprint,
  IconLanguage,
  IconLogout,
  IconPalette,
  IconSettings2,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import PersonalizationPanel from "./personalization-panel";
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

import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

const UserOptions = () => {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const { signOut } = useAuth();

  const [openPersonalization, setOpenPersonalization] = useState(false);

  if (isLoading) return null;

  const personalizationPanel = (
    <PersonalizationPanel
      open={openPersonalization}
      setOpen={setOpenPersonalization}
    />
  );

  if (!user) {
    return (
      <>
        <Button asChild>
          <Link href={`/auth/login?next=${pathname}`}>Iniciar sesión</Link>
        </Button>
        <Button variant="primary" asChild>
          <Link href="/auth/signup">Registrarse</Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => setOpenPersonalization(true)}
        >
          <IconPalette className="size-5" />
        </Button>
        {personalizationPanel}
      </>
    );
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            outline
            size="icon"
            className="outline-content-muted bg-base-200 rounded-full border-0 outline-2 outline-offset-2"
          >
            <UserAvatar profile={user.profile} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-60"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
            <UserAvatar profile={user.profile} className="size-12" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.profile.displayName}
              </span>
              <span className="text-content-muted truncate text-xs">
                {user?.email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/me/huds">
                <IconFingerprint />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconBell />
              Notificaciones
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconSettings2 />
              Configuración
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Preferencias</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setOpenPersonalization(true)}>
              <IconPalette />
              Personalización
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconLanguage />
              Idioma
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={async () => {
              await signOut();
              window.location.href = "/auth/login";
            }}
          >
            <IconLogout />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {personalizationPanel}
    </>
  );
};

export default UserOptions;
