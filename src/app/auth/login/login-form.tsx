"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useLocalStorage } from "usehooks-ts";

import { ButtonPassword } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resultMessages } from "@/lib";
import { loginSchema, LoginFormData } from "@/lib/form-schemas";

import ErrorMessage from "../_components/error-message";
import FooterForm from "../_components/footer-form";
import LastSessionButton from "../_components/last-session-button";
import SocialButtons from "../_components/social-buttons";
import SubmitButton from "../_components/submit-button";
import { login } from "../actions";

const STORAGE_KEY = "hudlab-remembered-email";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("next") || "/feed";

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [storageEmail, setStorageEmail, removeStorageEmail] = useLocalStorage(
    STORAGE_KEY,
    "",
  );

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const { control, handleSubmit, setValue } = form;

  useEffect(() => {
    if (storageEmail) {
      setValue("email", storageEmail);
      setValue("remember", true);
    }
  }, [setValue, storageEmail]);

  const handleSuccess = useCallback(
    async (data: LoginFormData) => {
      if (data.remember) {
        setStorageEmail(data.email);
      } else {
        removeStorageEmail();
      }
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    },
    [redirectUrl, setStorageEmail, removeStorageEmail],
  );

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      try {
        const result = await login(data);
        if (result.type === "success") {
          handleSuccess(data);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(resultMessages.UNKNOWN_ERROR);
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="z-10 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-5">
          <ErrorMessage error={error} />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="py-0">
                <FormLabel>Correo electrónico</FormLabel>
                <div className="bg-base-100">
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="email"
                      placeholder="Tu correo"
                      isAuth
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="py-0">
                <FormLabel>Contraseña</FormLabel>
                <div className="bg-base-100 relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Tu contraseña"
                      isAuth
                      {...field}
                    />
                  </FormControl>
                  <ButtonPassword
                    isVisible={showPassword}
                    setIsVisible={setShowPassword}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center">
          <FormField
            control={control}
            name="remember"
            render={({ field }) => (
              <FormItem className="py-0">
                <FormControl>
                  <label htmlFor="remember" className="flex items-start gap-2">
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={(checked: boolean) =>
                        field.onChange(checked)
                      }
                      className="border-alternative shadow-none"
                    />
                    <div className="inline-flex flex-col">
                      <p className="text-sm font-medium select-none">
                        Recordarme
                      </p>
                    </div>
                  </label>
                </FormControl>
              </FormItem>
            )}
          />
          <Link
            href="/auth/forgot-password"
            className="ms-auto text-sm font-semibold underline-offset-2 hover:underline"
            aria-label="¿Olvidaste tu contraseña?"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <SubmitButton
            type="submit"
            loadingText="Ingresando..."
            isSubmitting={pending}
          >
            Iniciar sesión
          </SubmitButton>
          <LastSessionButton />
          <SocialButtons isSubmitting={pending} />
        </div>
      </form>
      <FooterForm
        label="¿No tienes una cuenta?"
        linkText="Regístrate"
        link="/auth/signup"
      />
    </Form>
  );
};

export default LoginForm;
