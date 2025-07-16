"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ButtonPassword } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginFormData } from "@/lib/form-schemas";

import GoogleButton from "../_components/google-button";
import SubmitButton from "../_components/submit-button";
import { login } from "../actions";

const LoginForm = () => {
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const result = await login(data);
      if (result.type === "success") {
        toast.success(result.message);
        setTimeout(() => {
          window.location.href = result.redirectUrl || "/";
        }, 500);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="bg-base-100 gap-4">
      <CardHeader>
        <CardTitle>Inicia sesión en tu cuenta</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleButton isSubmitting={pending} className="mb-4" />
        <div className="relative my-4 flex items-center">
          <span className="flex-1 border-t border-gray-200" />
          <span className="mx-2 text-xs text-gray-400">o</span>
          <span className="flex-1 border-t border-gray-200" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="email"
                      placeholder="Tu correo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Tu contraseña"
                        {...field}
                      />
                      <ButtonPassword
                        isVisible={showPassword}
                        setIsVisible={setShowPassword}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SubmitButton
              type="submit"
              loadingText="Ingresando..."
              isSubmitting={pending}
              className="mt-6 w-full"
            >
              Iniciar sesión
            </SubmitButton>

            <div className="mt-6 text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/auth/signup"
                className="underline underline-offset-4"
              >
                Regístrate
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
