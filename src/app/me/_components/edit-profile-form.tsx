"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCheck,
  IconLoader2,
  IconPencilCheck,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateProfile } from "@/app/settings/_hooks/use-update-profile";
import { useUsernameCheck } from "@/app/settings/_hooks/use-username-check";
import AvatarView from "@/components/avatar-view";
import Loader from "@/components/loader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { useAvatarUpload } from "@/hooks/profile/use-avatar-upload";
import { useUser } from "@/hooks/use-user";
import {
  formErrors,
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib";

export function EditProfileForm() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();
  const profile = user?.profile;
  const initialUsername = profile?.username || "";

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      username: "",
      bio: "",
    },
  });

  const { control, handleSubmit, watch, setError, reset, formState } = form;

  useEffect(() => {
    if (user?.profile) {
      reset({
        displayName: user.profile.displayName || "",
        username: user.profile.username || "",
        bio: user.profile.bio || "",
      });
    }
  }, [user, reset]);

  const currentUsername = watch("username");
  const usernameCheck = useUsernameCheck(currentUsername, initialUsername);

  const { trigger: updateProfile, isMutating: isUpdatingProfile } =
    useUpdateProfile(initialUsername);
  const { trigger: uploadAvatar, isMutating: isUploadingAvatar } =
    useAvatarUpload(initialUsername);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar archivo
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      toast.error(formErrors.invalid.avatarFormat);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(formErrors.length.avatarMax);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      await uploadAvatar(formData);
      // Limpiar preview después del upload exitoso
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // El error ya se maneja en el hook
    }
  };

  const onSubmit = async (values: ProfileUpdateFormData) => {
    // Verificar que el username esté disponible antes de enviar
    if (values.username !== initialUsername && !usernameCheck.available) {
      setError("username", {
        type: "manual",
        message: "Username no disponible",
      });
      return;
    }

    await updateProfile(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo Avatar - Independiente del formulario */}
        <div className="space-y-2">
          <div className="rounded-box flex items-center justify-between gap-4 border p-4">
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <AvatarView
                  avatar={avatarPreview}
                  displayName={profile?.displayName || "Usuario"}
                >
                  <button aria-label="Ver avatar" className="rounded-full">
                    <Avatar className="size-16">
                      <AvatarImage src={avatarPreview} alt="Vista previa" />
                    </Avatar>
                  </button>
                </AvatarView>
              ) : (
                <AvatarView
                  avatar={profile?.avatarUrl || ""}
                  displayName={profile?.displayName || "Usuario"}
                >
                  <button aria-label="Ver avatar" className="rounded-full">
                    <UserAvatar profile={profile} className="size-16" />
                  </button>
                </AvatarView>
              )}
              <div className="grid">
                <p className="text-sm font-semibold">{profile?.displayName}</p>
                <span className="text-content-muted text-xs">
                  @{profile?.username}
                </span>
              </div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onAvatarChange}
                className="hidden"
              />
            </div>
            {avatarPreview ? (
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={removeAvatar}>
                  Restablecer
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader className="size-4" />
                      Guardando
                    </>
                  ) : (
                    <>
                      <IconCheck />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => avatarRef.current?.click()}
              >
                Cambiar avatar
              </Button>
            )}
          </div>
        </div>

        <FormField
          control={control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} maxLength={50} />
              </FormControl>
              <FormDescription>Tu nombre visible.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} maxLength={20} />
                  {currentUsername && currentUsername.length >= 3 && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                      {usernameCheck.checking ? (
                        <IconLoader2 className="text-muted-foreground size-4 animate-spin" />
                      ) : usernameCheck.available ? (
                        <IconCheck className="text-success size-4" />
                      ) : (
                        <IconX className="text-error size-4" />
                      )}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="flex justify-between">
                Solo letras, números y guiones bajos. Entre 3-20 caracteres.
                <span>{currentUsername?.length || 0}/20</span>
              </FormDescription>
              {currentUsername &&
                currentUsername !== initialUsername &&
                usernameCheck.available === false && (
                  <span className="text-error fieldset-legend text-sm font-medium">
                    Nombre de usuario no disponible
                  </span>
                )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presentación</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  rows={5}
                  maxLength={150}
                  className="min-h-20"
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                Máx 150 caracteres.
                <span>{field.value?.length || 0}/150</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isUpdatingProfile || !formState.isValid}
          >
            {isUpdatingProfile ? (
              <>
                <Loader className="size-4" />
                Guardando...
              </>
            ) : (
              <>
                <IconPencilCheck />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
