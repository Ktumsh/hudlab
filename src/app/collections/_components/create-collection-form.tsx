"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { UserSearchResult } from "@/lib/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useSimpleSearchDebounce } from "@/hooks/use-simple-debounce";
import { useUser } from "@/hooks/use-user";
import { useUserSearch } from "@/hooks/use-user-search";
import {
  CreateCollectionFormData,
  createCollectionSchema,
  formatDisplayName,
} from "@/lib";
import { useApiMutation } from "@/lib/use-mutation";

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
  const [isPrivate, setIsPrivate] = useState(false); // Cambió de isSecret a isPrivate
  const [collaborators, setCollaborators] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Obtener usuario actual
  const { user: currentUser } = useUser();

  const debouncedQuery = useSimpleSearchDebounce(searchQuery, 300);

  const { users: allSearchResults } = useUserSearch(debouncedQuery);

  const searchResults =
    searchQuery.trim().length > 0
      ? allSearchResults.filter(
          (user) =>
            user.id !== currentUser?.profile?.id &&
            !collaborators.find((c) => c.id === user.id),
        )
      : [];

  const form = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
    },
  });

  const createCollectionMutation = useApiMutation("/api/collections", "POST");

  const onSubmit = async (data: CreateCollectionFormData) => {
    try {
      const visibility = isPrivate ? "private" : "public";

      const result = (await createCollectionMutation.mutateAsync({
        ...data,
        visibility,
        collaborators: collaborators.map((c) => c.id),
      })) as CreateCollectionResponse;

      if (result.success && result.collection) {
        toast.success("Colección creada exitosamente");
        form.reset();
        setIsPrivate(false);
        setCollaborators([]);
        setSearchQuery("");
        router.refresh();
        setOpen(false);
      } else {
        toast.error(result.error || "Error al crear la colección");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Error inesperado al crear la colección");
    }
  };

  const addCollaborator = (user: UserSearchResult) => {
    setCollaborators((prev) => [...prev, user]);
    setSearchQuery("");
  };

  const removeCollaborator = (userId: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== userId));
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre de tu colección de HUDs"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="¿De qué trata tu colección?"
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Opción de privacidad */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="private"
                  className="cursor-pointer text-sm font-medium"
                >
                  Colección privada
                </label>
                <p className="text-content-muted mt-1 text-xs">
                  La colección no será visible para el público general.
                </p>
              </div>
            </div>

            <div className="fieldset">
              <FormLabel>Agregar colaboradores</FormLabel>
              <div className="relative">
                <IconSearch className="text-content-muted absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Buscar por nombre"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <div className="scrollbar-sm rounded-field max-h-40 overflow-y-auto border">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3">
                      <Avatar>
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.displayName}
                        />
                        <AvatarFallback>
                          {formatDisplayName(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.displayName}
                        </p>
                        <p className="text-content-muted truncate text-xs">
                          @{user.username}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        outline
                        onClick={() => addCollaborator(user)}
                      >
                        Agregar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Colaboradores agregados */}
            {collaborators.length > 0 && (
              <div className="fieldset">
                <p className="fieldset-legend text-sm leading-none">
                  Colaboradores ({collaborators.length})
                </p>
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="bg-base-200 flex items-center gap-3 rounded-lg p-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={collaborator.avatarUrl}
                          alt={
                            collaborator.displayName || collaborator.username
                          }
                        />
                        <AvatarFallback className="text-xs">
                          {formatDisplayName(collaborator.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {collaborator.displayName || collaborator.username}
                        </p>
                      </div>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeCollaborator(collaborator.id)}
                        className="p-0"
                      >
                        <IconX />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                disabled={!form.formState.isValid}
                type="submit"
                variant="primary"
                className="w-full"
              >
                {createCollectionMutation.isLoading ? "Creando..." : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollectionForm;
