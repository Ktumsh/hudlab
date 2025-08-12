"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import CollaboratorSelector from "./collaborator-selector";

import type { CollaboratorPermission, UserSearchResult } from "@/lib/types";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfileCollections } from "@/hooks/profile/use-profile-collections";
import { useUser } from "@/hooks/use-user";
import { CreateCollectionFormData, createCollectionSchema } from "@/lib";
import { apiPost } from "@/lib/fetcher";

interface CreateCollectionFormProps {
  children: React.ReactNode;
}

interface CreateCollectionResponse {
  success: boolean;
  error?: string;
  collection?: {
    id: string;
    name: string;
    description?: string;
  };
}

const CreateCollectionForm = ({ children }: CreateCollectionFormProps) => {
  const [open, setOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<UserSearchResult[]>([]);
  const [collaboratorsPermission] = useState<CollaboratorPermission>("admin");
  const { user } = useUser();

  const { refresh } = useProfileCollections(user?.profile.username ?? "");

  const form = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
    },
  });

  const { handleSubmit, reset, control, formState } = form;

  const { trigger: triggerCreate, isMutating: isCreating } = useSWRMutation(
    "/api/collections",
    async (
      _url,
      {
        arg,
      }: {
        arg: CreateCollectionFormData & {
          collaborators: string[];
          collaboratorsPermission: CollaboratorPermission;
        };
      },
    ) => apiPost<CreateCollectionResponse>("/api/collections", { body: arg }),
  );

  const onSubmit = async (data: CreateCollectionFormData) => {
    try {
      const result = await triggerCreate({
        ...data,
        collaborators: collaborators.map((c) => c.id), // Convertir a array de IDs
        collaboratorsPermission,
      });

      if (result.success && result.collection) {
        toast.success("Colección creada exitosamente");
        reset();
        setCollaborators([]);
        refresh();
        setOpen(false);
      } else {
        toast.error(result.error || "Error al crear la colección");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Error inesperado al crear la colección");
    }
  };

  // Funciones para manejar colaboradores
  const handleAddCollaborator = async (user: UserSearchResult) => {
    if (!collaborators.find((c) => c.id === user.id)) {
      setCollaborators((prev) => [...prev, user]);
    }
  };

  const handleRemoveCollaborator = async (profileId: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== profileId));
  };

  // Eliminar colaborador desde el propio selector

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear colección</DialogTitle>
          <DialogDescription className="sr-only">
            Completa el formulario para crear una nueva colección de HUDs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={100}
                      placeholder="Nombre de tu colección de HUDs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={200}
                      placeholder="¿De qué trata tu colección?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Opción de privacidad */}
            <FormField
              control={control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value === "private"}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          field.onChange(checked ? "private" : "public")
                        }
                        className="checkbox-lg!"
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Colección privada</FormLabel>
                      <p className="text-content-muted text-sm text-pretty">
                        La colección no será visible para la comunidad, sólo
                        para colaboradores.
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CollaboratorSelector
              currentCollaborators={collaborators}
              onAdd={handleAddCollaborator}
              onRemove={handleRemoveCollaborator}
              excludeUserIds={user?.profile?.id ? [user.profile.id] : []}
              showAcceptedStatus={false}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                variant="primary"
                wide
                disabled={!formState.isValid || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader className="mx-0 size-4" />
                    Creando...
                  </>
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollectionForm;
