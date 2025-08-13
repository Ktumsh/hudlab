"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  IconArrowLeft,
  IconChevronDown,
  IconCircleCheckFilled,
  IconPhotoEdit,
  IconPlus,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import CollaboratorSelector from "./collaborator-selector";
import CoverSelector from "./cover-selector";

import type {
  CollaboratorPermission,
  CollectionPreviewWithDetails,
  CollectionVisibility,
  UserSearchResult,
} from "@/lib/types";

import Loader from "@/components/loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import UserAvatar from "@/components/user-avatar";
import {
  useInviteCollaborator,
  useRemoveCollaborator,
  useUpdateCollaboratorsPermission,
} from "@/hooks/profile/use-collection-collaborators";
import { useCollectionRole } from "@/hooks/profile/use-collection-role";
import { usePendingInvitations } from "@/hooks/profile/use-pending-invitations";
import { useProfileCollections } from "@/hooks/profile/use-profile-collections";
import { useUser } from "@/hooks/use-user";
import {
  cn,
  createCollectionSchema,
  type CreateCollectionFormData,
} from "@/lib";
import { apiPost } from "@/lib/fetcher";

const permissions: Array<{
  id: "admin" | "designer";
  label: string;
  description: string;
}> = [
  {
    id: "admin",
    label: "Administrar",
    description:
      "Agregar y quitar HUDs, editar la colección e invitar nuevos colaboradores",
  },
  {
    id: "designer",
    label: "Diseñar",
    description: "Agregar y quitar HUDs",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

interface EditCollectionFormProps {
  collection: CollectionPreviewWithDetails;
  children: React.ReactNode;
}

interface UpdateCollectionResponse {
  success: boolean;
  error?: string;
  collection?: {
    id: string;
    name: string;
    description?: string;
    visibility: CollectionVisibility;
    coverImageUrl?: string;
  };
}

const EditCollectionForm = ({
  collection,
  children,
}: EditCollectionFormProps) => {
  const { user } = useUser();
  const { refresh } = useProfileCollections(user?.profile.username ?? "");
  const { inviteCollaborator } = useInviteCollaborator(collection.id);
  const { removeCollaborator } = useRemoveCollaborator(collection.id);
  const { updateCollaboratorsPermission, isUpdating } =
    useUpdateCollaboratorsPermission(collection.id);
  const { pendingInvitations, refresh: refreshPendingInvitations } =
    usePendingInvitations(collection.id);

  // Verificar permisos del usuario usando el hook de roles
  const { canManageCollaborators } = useCollectionRole(collection);

  const [isOpen, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  // Vistas del modal de edición: formulario principal, gestión de colaboradores y búsqueda/invitación
  const [view, setView] = useState<"form" | "collaborators" | "invite">("form");
  const [direction, setDirection] = useState(0);

  const existingPerms = collection.permissions || [];

  // Separar colaboradores aceptados de los pendientes
  const acceptedCollaborators = existingPerms.filter(
    (p) => p.profileId !== collection.profileId && p.status !== "pending",
  );

  const [collaborators, setCollaborators] = useState<string[]>(
    // Solo mostrar colaboradores aceptados en la gestión
    acceptedCollaborators.map((p) => p.profileId),
  );

  // Para mostrar chips con avatar/nombre en el selector
  const initialCollaborators: UserSearchResult[] =
    acceptedCollaborators.map<UserSearchResult>((p) => ({
      id: p.profile.id,
      username: p.profile.username,
      displayName: p.profile.displayName,
      avatarUrl: p.profile.avatarUrl,
    }));

  const [collaboratorsDetails, setCollaboratorsDetails] =
    useState<UserSearchResult[]>(initialCollaborators);
  // Selector global de permisos para colaboradores
  // Inicializar con el permiso actual de los colaboradores existentes o "admin" por defecto
  const [collaboratorsPermission, setCollaboratorsPermission] =
    useState<CollaboratorPermission>(
      acceptedCollaborators.length > 0 && acceptedCollaborators[0]?.permission
        ? (acceptedCollaborators[0].permission as CollaboratorPermission)
        : "admin",
    );
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  const form = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || "",
      visibility: collection.visibility as CollectionVisibility,
    },
  });

  const { handleSubmit, control, formState } = form;

  const { trigger: triggerUpdate, isMutating: isUpdatingCollection } =
    useSWRMutation(
      `/api/collections/${collection.id}`,
      async (
        _url,
        {
          arg,
        }: {
          arg: Partial<CreateCollectionFormData> & {
            coverImageUrl?: string;
            collaborators?: string[];
            collaboratorsPermission?: CollaboratorPermission;
          };
        },
      ) =>
        apiPost<UpdateCollectionResponse>(`/api/collections/${collection.id}`, {
          body: arg,
          method: "PUT",
        }),
    );

  const navigateToView = (newView: typeof view) => {
    const viewOrder = ["form", "collaborators", "invite"];
    const currentIndex = viewOrder.indexOf(view);
    const newIndex = viewOrder.indexOf(newView);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setView(newView);
  };

  const onSubmit = async (data: CreateCollectionFormData) => {
    try {
      // Solo enviar los datos básicos de la colección, sin colaboradores
      const payload: Partial<CreateCollectionFormData> & {
        coverImageUrl?: string;
      } = {
        ...data,
        coverImageUrl,
      };

      const result = await triggerUpdate(payload);

      if (result.success) {
        toast.success("Colección actualizada exitosamente");
        refresh();
        setOpen(false);
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
  };

  const handleRemoveCollaborator = async (id: string) => {
    try {
      const result = await removeCollaborator({ profileId: id });
      if (result.success) {
        setCollaborators((prev) => prev.filter((cId) => cId !== id));
        setCollaboratorsDetails((prev) => prev.filter((u) => u.id !== id));
        refresh(); // Refrescar la lista de colecciones
        refreshPendingInvitations(); // Refrescar invitaciones pendientes
        toast.success("Colaborador eliminado exitosamente");
      } else {
        toast.error(result.error || "Error al eliminar colaborador");
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast.error("Error al eliminar colaborador");
    }
  };

  const handleInviteCollaborator = async (user: UserSearchResult) => {
    try {
      const result = await inviteCollaborator({
        profileId: user.id,
        permission: collaboratorsPermission,
        userProfile: user,
      });
      if (!result.success) {
        toast.error(result.error || "Error al enviar invitación");
      }
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast.error("Error al enviar invitación");
    }
  };

  const handlePermissionChange = async (permission: CollaboratorPermission) => {
    // Solo actualizar si hay colaboradores o invitaciones pendientes
    const hasCollaborators = acceptedCollaborators.length > 0;
    const hasPendingInvitations = pendingInvitations.length > 0;

    if (hasCollaborators || hasPendingInvitations) {
      try {
        // Actualizar estado local inmediatamente
        setCollaboratorsPermission(permission);

        // Actualizar en el backend optimísticamente
        const result = await updateCollaboratorsPermission({ permission });

        if (!result.success) {
          // Revertir cambio local si falla
          setCollaboratorsPermission(collaboratorsPermission);
          toast.error(result.error || "Error al actualizar permisos");
        }
      } catch (error) {
        // Revertir cambio local si falla
        setCollaboratorsPermission(collaboratorsPermission);
        console.error("Error updating permissions:", error);
        toast.error("Error al actualizar permisos");
      }
    } else {
      // Solo cambiar estado local si no hay colaboradores
      setCollaboratorsPermission(permission);
    }
  };

  const selectedPermission = useMemo(
    () =>
      permissions.find(
        (permission) => permission.id === collaboratorsPermission,
      ),
    [collaboratorsPermission],
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger
          asChild
          onClick={(e) => {
            setOpen(true);
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {children}
        </DialogTrigger>
        <DialogContent
          className="overflow-hidden sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <AnimatePresence
              mode="popLayout"
              custom={direction}
              initial={false}
            >
              {view === "form" && (
                <motion.div
                  key="form-header"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                  }}
                >
                  <DialogTitle className="text-center">
                    Editar colección
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Modifica los detalles de tu colección
                  </DialogDescription>
                </motion.div>
              )}
              {view === "collaborators" && canManageCollaborators && (
                <motion.div
                  key="collaborators-header"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                  }}
                  className="flex items-center gap-2"
                >
                  <Button size="icon-lg" onClick={() => navigateToView("form")}>
                    <IconArrowLeft className="size-5" />
                  </Button>
                  <div className="flex flex-col gap-1">
                    <DialogTitle>Colaboradores</DialogTitle>
                    <DialogDescription className="text-xs">
                      Define permisos y gestiona colaboradores de esta colección
                    </DialogDescription>
                  </div>
                </motion.div>
              )}
              {view === "invite" && canManageCollaborators && (
                <motion.div
                  key="invite-header"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                  }}
                  className="flex items-center gap-2"
                >
                  <Button
                    size="icon-lg"
                    onClick={() => navigateToView("collaborators")}
                  >
                    <IconArrowLeft className="size-5" />
                  </Button>
                  <div className="flex flex-col gap-1">
                    <DialogTitle>Invitar a colaboradores</DialogTitle>
                    <DialogDescription className="text-xs">
                      Busca usuarios para invitar a esta colección
                    </DialogDescription>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogHeader>

          <div className="relative">
            <AnimatePresence
              mode="popLayout"
              custom={direction}
              initial={false}
            >
              {view === "form" && (
                <motion.div
                  key="form-content"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                  }}
                >
                  <Form {...form}>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      {collection.previewUploads.length > 0 && (
                        <div className="fieldset">
                          <Label className="fieldset-legend mx-auto">
                            Portada
                          </Label>
                          <div className="mx-auto flex items-center gap-2">
                            <div
                              className="rounded-box bg-base-200 group relative size-32 cursor-pointer overflow-hidden"
                              onClick={() => setShowCoverSelector(true)}
                            >
                              {coverImageUrl && (
                                <Image
                                  src={coverImageUrl}
                                  alt="Portada actual"
                                  width={200}
                                  height={200}
                                  className="aspect-square h-full object-cover"
                                />
                              )}
                              <div className="bg-base-100/50 absolute inset-0 grid place-content-center opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  title="Editar portada de la colección"
                                  type="button"
                                  size="icon-lg"
                                  disabled={
                                    collection.previewUploads.length === 0
                                  }
                                  className="text-base-200 border-0 bg-white/80 hover:bg-white"
                                  onClick={() => setShowCoverSelector(true)}
                                >
                                  <span className="sr-only">
                                    Editar portada de la colección
                                  </span>
                                  <IconPhotoEdit className="size-6" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

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

                      {canManageCollaborators && (
                        <div className="fieldset">
                          <Label className="fieldset-legend">
                            Colaboradores
                          </Label>
                          <div className="flex items-center justify-between gap-4">
                            <div className="avatar-group -space-x-3">
                              <UserAvatar
                                profile={collection.profile}
                                className="avatar size-11"
                              />
                              {initialCollaborators.slice(0, 9).map((c) => (
                                <UserAvatar
                                  key={c.id}
                                  profile={c}
                                  className="avatar size-11"
                                />
                              ))}
                              {initialCollaborators.length > 9 && (
                                <Avatar className="avatar avatar-placeholder size-11">
                                  <AvatarFallback>
                                    +{collaborators.length - 9}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <Button
                              type="button"
                              size="icon-lg"
                              onClick={() => navigateToView("collaborators")}
                            >
                              <IconPlus className="size-6" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value === "private"}
                                  onCheckedChange={(
                                    checked: boolean | "indeterminate",
                                  ) =>
                                    field.onChange(
                                      checked ? "private" : "public",
                                    )
                                  }
                                  className="checkbox-lg!"
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Colección privada</FormLabel>
                                <p className="text-content-muted text-sm text-pretty">
                                  La colección no será visible para la
                                  comunidad, sólo para colaboradores.
                                </p>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="submit"
                          variant="primary"
                          wide
                          disabled={
                            isUpdatingCollection ||
                            !formState.isValid ||
                            !formState.isDirty
                          }
                        >
                          {isUpdatingCollection ? (
                            <>
                              <Loader className="mx-0 size-4" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar cambios"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </motion.div>
              )}

              {view === "collaborators" && canManageCollaborators && (
                <motion.div
                  key="collaborators-content"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                  }}
                  className="space-y-4"
                >
                  <div className="fieldset grid-cols-2">
                    <div>
                      <div className="text-content-muted text-sm">
                        En esta colección
                      </div>
                      <Label>Los colaboradores pueden...</Label>
                    </div>
                    <DropdownMenu
                      modal={false}
                      open={openDropdown}
                      onOpenChange={setOpenDropdown}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          outline
                          wide
                          className="justify-between"
                          disabled={isUpdating}
                        >
                          <span>{selectedPermission?.label}</span>
                          {isUpdating ? (
                            <Loader className="ms-auto mr-0 size-4" />
                          ) : (
                            <IconChevronDown
                              className={cn(
                                "transition-transform",
                                openDropdown ? "rotate-180" : "rotate-0",
                              )}
                            />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="flex flex-col gap-1"
                      >
                        {permissions.map((perm) => (
                          <DropdownMenuItem
                            key={perm.id}
                            data-active={perm.id === collaboratorsPermission}
                            onSelect={() =>
                              handlePermissionChange(
                                perm.id as CollaboratorPermission,
                              )
                            }
                            disabled={isUpdating}
                            className="group/item data-[active=true]:bg-primary/10 h-auto justify-between gap-1"
                          >
                            <div>
                              <p className="font-medium">{perm.label}</p>
                              <p className="text-content-muted">
                                {perm.description}
                              </p>
                            </div>
                            <div className="opacity-0 group-data-[active=true]/item:opacity-100">
                              <IconCircleCheckFilled className="text-primary size-6" />
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="fieldset py-0">
                    <Label className="fieldset-legend">Colaboradores</Label>
                    <ScrollArea className="max-h-60">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            profile={collection.profile}
                            className="size-9"
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {collection.profile.displayName}
                            </div>
                            <div className="text-content-muted">
                              Propietario
                            </div>
                          </div>
                        </div>
                        {collaborators.map((id) => {
                          const c = collaboratorsDetails.find(
                            (u) => u.id === id,
                          );
                          if (!c) return null;
                          return (
                            <div
                              key={id}
                              className="grid grid-cols-[auto_1fr_auto] gap-2"
                            >
                              <UserAvatar profile={c} className="size-9" />
                              <div className="max-w-full grow overflow-hidden">
                                <div className="truncate text-sm font-medium">
                                  {c?.displayName}
                                </div>
                                <div className="text-content-muted">
                                  Invitado
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="text-error"
                                onClick={() => handleRemoveCollaborator(id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <Button wide onClick={() => navigateToView("invite")}>
                      <IconPlus />
                      Invitar a colaboradores
                    </Button>
                  </div>
                </motion.div>
              )}

              {view === "invite" && canManageCollaborators && (
                <motion.div
                  key="invite-content"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                  }}
                  className="space-y-2"
                >
                  <CollaboratorSelector
                    hideLabel
                    currentCollaborators={collaboratorsDetails}
                    pendingInvitations={pendingInvitations}
                    onAdd={handleInviteCollaborator}
                    excludeUserIds={[
                      collection.profile.id,
                      ...collaboratorsDetails.map((c) => c.id),
                      ...pendingInvitations.map((inv) => inv.profile.id),
                    ]}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de portada */}
      <CoverSelector
        collection={collection}
        isOpen={showCoverSelector}
        onClose={() => setShowCoverSelector(false)}
        initialSelected={coverImageUrl}
        onSelect={handleCoverSelect}
      />
    </>
  );
};

export default EditCollectionForm;
