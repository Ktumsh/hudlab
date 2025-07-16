"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { getExistingEmail } from "@/db/querys/user-querys";
import { signupSchema, type SignupFormData } from "@/lib/form-schemas";
import { resultMessages } from "@/lib/result";

import RegisterInfoStep from "./signup-email-step";
import RegisterPasswordStep from "./signup-password-step";
import GoogleButton from "../../_components/google-button";
import SubmitButton from "../../_components/submit-button";
import { signup } from "../../actions";

const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit, trigger, watch } = form;

  const email = watch("email");

  const handleNext = async () => {
    const ok = await trigger(["displayName", "email"]);
    if (!ok) return;
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const exists = await getExistingEmail(email);
      if (exists) {
        toast.error(resultMessages.EMAIL_ALREADY_EXISTS);
        return;
      }

      setStep(2);
    } catch (error) {
      console.error("Error al verificar correo:", error);
      toast.error(resultMessages.CHECK_EMAIL_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const result = await signup(data);

      if (result.type === "success") {
        toast.success(result.message);
        setTimeout(() => {
          window.location.href = result.redirectUrl || "/";
        }, 500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      toast.error(resultMessages.SIGNUP_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepMessages: Record<number, string> = {
    1: "Ingresa tu nombre, apellido y correo electrónico",
    2: "Crea una contraseña segura para tu cuenta",
  };

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Crea una cuenta</CardTitle>
        <CardDescription>{stepMessages[step]}</CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleButton isSubmitting={isSubmitting} className="mb-4" />
        <div className="relative my-4 flex items-center">
          <span className="flex-1 border-t border-gray-200" />
          <span className="mx-2 text-xs text-gray-400">o</span>
          <span className="flex-1 border-t border-gray-200" />
        </div>
        <Form {...form}>
          <form>
            {step === 1 && <RegisterInfoStep control={control} />}

            {step === 2 && (
              <RegisterPasswordStep control={control} watch={watch} />
            )}
          </form>
        </Form>
        {step === 1 ? (
          <SubmitButton
            isSubmitting={isSubmitting}
            loadingText="Continuando..."
            onClick={handleNext}
            className="mt-6 w-full"
          >
            Continuar
          </SubmitButton>
        ) : (
          <div className="mt-6 flex gap-4">
            <Button disabled={isSubmitting} outline onClick={() => setStep(1)}>
              Atrás
            </Button>
            <SubmitButton
              isSubmitting={isSubmitting}
              loadingText="Creando cuenta..."
              onClick={handleSubmit(onSubmit)}
            >
              Crear cuenta
            </SubmitButton>
          </div>
        )}
        <div className="mt-6 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Inicia sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
