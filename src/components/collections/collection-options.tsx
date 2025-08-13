"use client";

import {
  IconDots,
  IconMessageReport,
  IconShare3,
  IconTrash,
} from "@tabler/icons-react";
import { useMemo } from "react";

import ShareSheet from "../share-sheet";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { useIsMobile } from "@/hooks/use-mobile";

interface CollectionOptionsProps {
  isSelf: boolean;
  collectionName: string;
  collectionDescription: string;
}

const CollectionOptions = ({
  isSelf,
  collectionName,
  collectionDescription,
}: CollectionOptionsProps) => {
  const isMobile = useIsMobile();

  const shareSheetTitle = useMemo(() => {
    return `Compartir "${collectionName}"`;
  }, [collectionName]);

  const shareText = useMemo(
    () =>
      collectionDescription
        ? collectionDescription
        : "¡Echa un vistazo a esta colección en HUDLab!",
    [collectionDescription],
  );

  if (isMobile) {
    return (
      <ShareSheet sheetTitle={shareSheetTitle} text={shareText}>
        <Button size="sm" className="flex-1">
          Compartir colección
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
        <ShareSheet sheetTitle={shareSheetTitle} text={shareText}>
          <button className="hover:bg-base-300 rounded-field hover:text-neutral-content [&_svg:not([class*='text-'])]:text-base-content/60 hover:[&_svg:not([class*='text-'])]:text-neutral-content/60 relative flex h-10 w-full items-center gap-2 px-3 py-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <IconShare3 />
            Compartir
          </button>
        </ShareSheet>
        {isSelf ? (
          <>
            <DropdownMenuItem variant="destructive">
              <IconTrash />
              Eliminar
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem variant="destructive">
              <IconMessageReport />
              Reportar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CollectionOptions;
