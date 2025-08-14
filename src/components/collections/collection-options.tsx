"use client";

import {
  IconDots,
  IconMessageReport,
  IconShare3,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ShareSheet from "../share-sheet";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { useIsMobile } from "@/hooks/use-mobile";
import { apiDelete } from "@/lib/fetcher";

interface CollectionOptionsProps {
  isSelf: boolean;
  collectionId: string;
  collectionName: string;
  collectionDescription: string;
}

const CollectionOptions = ({
  isSelf,
  collectionId,
  collectionName,
  collectionDescription,
}: CollectionOptionsProps) => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteCollection = async () => {
    setIsDeleting(true);
    try {
      const result = await apiDelete<{ success: boolean }>(
        `/api/collections/${collectionId}`,
      );

      if (result.success) {
        toast.success("Colección eliminada exitosamente");
        router.push("/me"); // Redirigir al perfil
      } else {
        toast.error("Error al eliminar la colección");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Error al eliminar la colección");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isMobile) {
    return (
      <>
        <ShareSheet sheetTitle={shareSheetTitle} text={shareText}>
          <Button size="sm" className="flex-1">
            Compartir colección
          </Button>
        </ShareSheet>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar colección</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar &quot;{collectionName}
                &quot;? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="error"
                onClick={handleDeleteCollection}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
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
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar colección</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{collectionName}&quot;?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="error"
              onClick={handleDeleteCollection}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollectionOptions;
