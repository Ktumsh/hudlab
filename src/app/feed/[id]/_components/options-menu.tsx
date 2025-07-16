import { IconDots } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OptionsMenuProps {
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const OptionsMenu = ({ isOwn, onEdit, onDelete }: OptionsMenuProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="size-6">
          <span className="sr-only">Opciones</span>
          <IconDots className="size-3.5 md:size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-10">
        {isOwn ? (
          <>
            <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>Eliminar</DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>Reportar</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OptionsMenu;
