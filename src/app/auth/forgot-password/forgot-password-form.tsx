"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import BackToLoginButton from "../_components/back-to-login-button";
import SubmitButton from "../_components/submit-button";
import { useAuthForm } from "../_hooks/use-auth-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiUrl } from "@/lib";
import { forgotPasswordSchema, ForgotPasswordData } from "@/lib/form-schemas";

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const { setEmail, setStep: setFormStep } = useAuthForm();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { control, handleSubmit } = form;

  const onSend = async (data: ForgotPasswordData) => {
    if (isSubmitting) return;
    try {
      const { email } = data;
      setIsSubmitting(true);

      const response = await fetch(`${apiUrl}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType: "reset_password",
          payload: { email },
        }),
      });

      const res = await response.json();

      if (!res.status) {
        toast.error(res.message);
        return;
      }
      setEmail(email);
      setFormStep(2);
      setStep(2);
    } catch (err) {
      console.error("Error al enviar enlace:", err);
      toast.error("No se pudo enviar el enlace. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    if (isSubmitting) return;

    const email = form.getValues("email");
    if (!email) {
      toast.error("Por favor ingresa tu correo primero");
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiUrl}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType: "reset_password",
          payload: { email },
        }),
      });

      const res = await response.json();

      if (res.status) {
        toast.success("Enlace reenviado exitosamente");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Error al reenviar enlace:", err);
      toast.error("No se pudo reenviar el enlace. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return step === 1 ? (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSend)}
        className="z-10 flex flex-col gap-6"
      >
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="py-0">
              <FormLabel>Correo electrónico</FormLabel>
              <div className="bg-base-100">
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Ingresa tu correo"
                    isAuth
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton
          type="submit"
          isSubmitting={isSubmitting}
          loadingText="Enviando..."
        >
          Recuperar contraseña
        </SubmitButton>
      </form>
      <BackToLoginButton />
    </Form>
  ) : (
    <>
      <SubmitButton
        type="button"
        className="z-10"
        isSubmitting={false}
        loadingText="Abriendo..."
        onClick={() => {
          window.location.href = "mailto:";
        }}
      >
        Abrir aplicación de correo
      </SubmitButton>

      <div className="flex flex-col items-center gap-8 text-center">
        <p className="flex gap-1">
          <span className="text-content-muted text-sm">
            ¿No recibiste el correo?
          </span>
          <Button variant="link" onClick={onResend} disabled={isSubmitting}>
            Reenviar enlace
          </Button>
        </p>
        <BackToLoginButton />
      </div>
    </>
  );
}
