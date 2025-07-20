"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ButtonPassword } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, ResetPasswordData } from "@/lib/form-schemas";
import { cn } from "@/lib/utils";

import BackToLoginButton from "../_components/back-to-login-button";
import SubmitButton from "../_components/submit-button";
import { resetPassword, verifyResetToken } from "../actions";

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("tk") || "";

  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit, watch } = form;

  // Verificar token al cargar el componente
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValidToken(false);
        toast.error("Token de restablecimiento no válido");
        router.push("/auth/forgot-password");
        return;
      }

      try {
        const result = await verifyResetToken(token);
        if (result.success) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error al verificar token:", error);
        setIsValidToken(false);
        toast.error(
          "Error al verificar el enlace. Intenta solicitar uno nuevo.",
        );
      }
    };

    checkToken();
  }, [token, router]);

  const pwd = watch("password");

  if (isValidToken === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 size-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-content-muted">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="alert alert-error alert-outline bg-base-100! alert-vertical sm:alert-horizontal items-start">
          <div>
            <h3 className="mb-1 font-semibold">Enlace inválido o expirado</h3>
            <p className="text-error/90 text-sm">
              El enlace de restablecimiento no es válido o ha expirado.
            </p>
          </div>
        </div>
        <BackToLoginButton />
      </div>
    );
  }

  const requirements = [
    { label: "Al menos 8 caracteres", valid: pwd.length >= 8 },
    { label: "Al menos un número", valid: /[0-9]/.test(pwd) },
    { label: "Al menos una letra minúscula", valid: /[a-z]/.test(pwd) },
    { label: "Al menos una letra mayúscula", valid: /[A-Z]/.test(pwd) },
    {
      label: "Al menos un carácter especial (@#$%&*)",
      valid: /[^A-Za-z0-9]/.test(pwd),
    },
  ];

  const onSubmit = async (data: ResetPasswordData) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await resetPassword(token, data.password);

      if (res.type === "success") {
        toast.success(res.message);
        router.push("/auth/login");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      toast.error("No se pudo restablecer la contraseña. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="z-10 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-5">
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="py-0">
                <FormLabel>Nueva contraseña</FormLabel>
                <div className="bg-base-100 relative">
                  <FormControl>
                    <Input
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      isAuth
                      {...field}
                    />
                  </FormControl>
                  <ButtonPassword
                    isVisible={showPwd}
                    setIsVisible={() => setShowPwd((v) => !v)}
                  />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="py-0">
                <FormLabel>Confirmar contraseña</FormLabel>
                <div className="bg-base-100 relative">
                  <FormControl>
                    <Input
                      type={showConf ? "text" : "password"}
                      placeholder="••••••••"
                      isAuth
                      {...field}
                    />
                  </FormControl>
                  <ButtonPassword
                    isVisible={showConf}
                    setIsVisible={() => setShowConf((v) => !v)}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <ul className="space-y-1 text-sm">
            {requirements.map(({ label, valid }) => (
              <li
                key={label}
                className={cn(
                  "text-content-muted flex items-center gap-2",
                  valid && "text-green-400",
                )}
              >
                <IconCircleCheckFilled className="size-5" />
                {label}
              </li>
            ))}
          </ul>
          <SubmitButton
            type="submit"
            isSubmitting={isSubmitting}
            loadingText="Restableciendo contraseña..."
          >
            Restablecer contraseña
          </SubmitButton>
        </div>
      </form>
      <BackToLoginButton />
    </Form>
  );
}
