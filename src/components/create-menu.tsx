"use client";

import { IconPhoto, IconStar } from "@tabler/icons-react";
import { useState } from "react";

import CreateCollectionForm from "@/components/collections/create-collection-form";
import CreateUploadForm from "@/components/create-upload-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CreateMenuProps {
  children: React.ReactNode;
}

const CreateMenu = ({ children }: CreateMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-2" sideOffset={8}>
        <div className="space-y-1">
          <CreateUploadForm>
            <Button variant="ghost" className="h-auto w-full justify-start p-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-box flex h-9 w-9 items-center justify-center">
                  <IconPhoto className="text-primary h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Crear HUD</div>
                  <div className="text-muted-foreground text-sm">
                    Sube tu diseño de interfaz
                  </div>
                </div>
              </div>
            </Button>
          </CreateUploadForm>

          <CreateCollectionForm>
            <Button variant="ghost" className="h-auto w-full justify-start p-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-box flex h-9 w-9 items-center justify-center">
                  <IconStar className="text-primary h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Crear colección</div>
                  <div className="text-muted-foreground text-sm">
                    Organiza tus HUDs favoritos
                  </div>
                </div>
              </div>
            </Button>
          </CreateCollectionForm>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateMenu;
