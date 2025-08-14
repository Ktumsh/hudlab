import {
  IconDots,
  IconLockExclamation,
  IconLogout,
  IconMessageReport,
  IconSettings2,
  IconShare3,
} from "@tabler/icons-react";
import { useMemo } from "react";

import type { Profile } from "@/lib/types";

import ShareSheet from "@/components/share-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileOptionsProps {
  profile?: Profile | null;
  isSelf: boolean;
}

const ProfileOptions = ({ profile, isSelf }: ProfileOptionsProps) => {
  const isMobile = useIsMobile();
  const username = profile?.username;
  const displayName = profile?.displayName;

  const { signOut } = useAuth();

  const shareSheetTitle = useMemo(() => {
    return isSelf
      ? "Compartir mi perfil"
      : `Compartir perfil de ${displayName ? displayName : `@${username}`}`;
  }, [displayName, username, isSelf]);

  const shareText = useMemo(
    () =>
      `¡Echa un vistazo al perfil de ${displayName ? displayName : `@${username}`} en HUDLab!`,
    [displayName, username],
  );

  const shareUrl = useMemo(
    () =>
      (typeof window !== "undefined" &&
        `${window.location.origin}/${username}/huds`) ||
      "",
    [username],
  );

  if (isMobile) {
    return (
      <ShareSheet sheetTitle={shareSheetTitle} text={shareText} url={shareUrl}>
        <Button size="sm" className="flex-1">
          Compartir perfil
        </Button>
      </ShareSheet>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-md">
          <IconDots className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ShareSheet
          sheetTitle={shareSheetTitle}
          text={shareText}
          url={shareUrl}
        >
          <button className="hover:bg-base-300 rounded-field hover:text-neutral-content [&_svg:not([class*='text-'])]:text-base-content/60 hover:[&_svg:not([class*='text-'])]:text-neutral-content/60 relative flex h-10 w-full items-center gap-2 px-3 py-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <IconShare3 />
            Compartir
          </button>
        </ShareSheet>
        {isSelf ? (
          <>
            <DropdownMenuItem>
              <IconSettings2 />
              Configuración
            </DropdownMenuItem>
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
          </>
        ) : (
          <>
            <DropdownMenuItem variant="destructive">
              <IconMessageReport />
              Reportar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <IconLockExclamation />
              Bloquear
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileOptions;
