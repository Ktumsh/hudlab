"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import CoverSelector from "./cover-selector";
import CollaboratorSelector from "../../../_components/collaborator-selector";

import type { CollectionWithFullDetails } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCollectionSchema, type CreateCollectionFormData } from "@/lib";
import { useApiMutation } from "@/lib/use-mutation";

interface EditCollectionFormProps {
  collection: CollectionWithFullDetails;
  isOpen: boolean;
  onClose: () => void;
}

interface UpdateCollectionResponse {
  success: boolean;
  error?: string;
  collection?: {
    id: string;
    name: string;
    description?: string;
    visibility: "public" | "private" | "restricted";
    coverImageUrl?: string;
  };
}

const EditCollectionForm = ({
  collection,
  isOpen,
  onClose,
}: EditCollectionFormProps) => {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(
    collection.visibility === "private",
  );
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  const form = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || "",
      visibility: "public", // Este campo no se usa directamente, usamos isPrivate
    },
  });

  const updateCollectionMutation = useApiMutation(
    `/api/collections/${collection.id}`,
    "PUT",
  );

  const onSubmit = async (data: CreateCollectionFormData) => {
    try {
      const visibility = isPrivate ? "private" : "public";

      const result = (await updateCollectionMutation.mutateAsync({
        ...data,
        visibility,
        collaborators,
        coverImageUrl,
      })) as UpdateCollectionResponse;

      if (result.success) {
        toast.success("Colección actualizada exitosamente");
        form.reset();
        setIsPrivate(false);
        setCollaborators([]);
        setCoverImageUrl("");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Error al actualizar la colección");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar la colección");
    }
  };

  const [coverImageUrl, setCoverImageUrl] = useState(
    collection.coverImageUrl || "",
  );

  const handleCoverSelect = (imageUrl: string) => {
    setCoverImageUrl(imageUrl);
    setShowCoverSelector(false);
    toast.success("Portada actualizada");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar colección</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu colección
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nombre de la colección"
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
                      <Textarea
                        {...field}
                        placeholder="Describe tu colección (opcional)"
                        rows={3}
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
                  onCheckedChange={(checked) =>
                    setIsPrivate(checked as boolean)
                  }
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

              {/* Portada de la colección */}
              <div className="space-y-2">
                <Label>Portada de la colección</Label>
                <div className="flex items-center gap-2">
                  {coverImageUrl && (
                    <div className="relative size-12 overflow-hidden rounded-md border">
                      <Image
                        src={coverImageUrl}
                        alt="Portada actual"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCoverSelector(true)}
                    disabled={collection.items.length === 0}
                  >
                    {coverImageUrl ? "Cambiar portada" : "Seleccionar portada"}
                  </Button>
                  {coverImageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCoverImageUrl("")}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
                {collection.items.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    Agrega uploads a la colección para poder seleccionar una
                    portada
                  </p>
                )}
              </div>

              {/* Colaboradores */}
              <div className="space-y-2">
                <Label>Colaboradores</Label>
                <CollaboratorSelector
                  selectedCollaborators={collaborators}
                  onCollaboratorsChange={setCollaborators}
                />
                <p className="text-muted-foreground text-xs">
                  {isPrivate
                    ? "Los colaboradores pueden ver y editar esta colección privada"
                    : "Los colaboradores pueden editar esta colección pública"}
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateCollectionMutation.isLoading}
                >
                  {updateCollectionMutation.isLoading
                    ? "Guardando..."
                    : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de portada */}
      <CoverSelector
        collection={collection}
        isOpen={showCoverSelector}
        onClose={() => setShowCoverSelector(false)}
        onSelect={handleCoverSelect}
      />
    </>
  );
};

export default EditCollectionForm;
