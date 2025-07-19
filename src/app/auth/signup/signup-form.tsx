"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { useState, useCallback, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { ButtonPassword } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getExistingEmail } from "@/db/querys/user-querys";
import { cn } from "@/lib";
import { signupSchema, type SignupFormData } from "@/lib/form-schemas";
import { resultMessages } from "@/lib/result";

import ErrorMessage from "../_components/error-message";
import FooterForm from "../_components/footer-form";
import LastSessionButton from "../_components/last-session-button";
import SocialButtons from "../_components/social-buttons";
import SubmitButton from "../_components/submit-button";
import { useSignupForm } from "../_hooks/use-signup-form";
import { signup } from "../actions";

const SignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { setEmail, setStep: setFormStep } = useSignupForm();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const { control, handleSubmit, trigger, watch, getValues } = form;
  const pwd = watch("password");

  const requirements = useMemo(
    () => [
      { label: "Al menos 8 caracteres", valid: pwd.length >= 8 },
      { label: "Al menos un número", valid: /[0-9]/.test(pwd) },
      { label: "Al menos una letra minúscula", valid: /[a-z]/.test(pwd) },
      { label: "Al menos una letra mayúscula", valid: /[A-Z]/.test(pwd) },
      {
        label: "Al menos un carácter especial (@#$%&*)",
        valid: /[^A-Za-z0-9]/.test(pwd),
      },
    ],
    [pwd],
  );

  const handleNext = useCallback(async () => {
    const ok = await trigger(["email"]);
    if (!ok) return;
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const emailValue = getValues("email");
      const exists = await getExistingEmail(emailValue);
      if (exists) {
        setError(resultMessages.EMAIL_ALREADY_EXISTS);
        return;
      }
      setEmail(emailValue);
      setFormStep(2);
      if (error && !exists) setError(null);
      setStep(2);
    } catch (error) {
      console.error("Error al verificar correo:", error);
      toast.error(resultMessages.CHECK_EMAIL_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, trigger, getValues, setEmail, setFormStep, error]);

  const onSubmit: SubmitHandler<SignupFormData> = useCallback(
    async (data) => {
      if (isSubmitting) return;
      try {
        setIsSubmitting(true);
        const result = await signup(data);
        if (result.type === "success") {
          toast.success(result.message);
          setTimeout(() => {
            window.location.href = result.redirectUrl || "/feed";
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
    },
    [isSubmitting],
  );

  const formOnSubmit = useMemo(() => {
    return step === 2 ? handleSubmit(onSubmit) : undefined;
  }, [step, handleSubmit, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (step === 1) {
          handleNext();
        } else {
          handleSubmit(onSubmit)();
        }
      }
    },
    [step, handleNext, handleSubmit, onSubmit],
  );

  return (
    <Form {...form}>
      <form
        autoComplete="off"
        onSubmit={formOnSubmit}
        onKeyDown={handleKeyDown}
        className="z-10 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-5">
          <ErrorMessage error={error} />
          {step === 1 && (
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
                        placeholder="Tu correo"
                        isAuth
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="pb-0" />
                </FormItem>
              )}
            />
          )}
          {step === 2 && (
            <>
              <FormField
                control={control}
                name="displayName"
                render={({ field }) => (
                  <FormItem className="py-0">
                    <FormLabel>Nombre</FormLabel>
                    <div className="bg-base-100">
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Tu nombre"
                          autoComplete="new-name"
                          isAuth
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="pb-0" />
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
                          {...field}
                          type={isVisiblePassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          autoComplete="new-password"
                          isAuth
                        />
                      </FormControl>
                      <ButtonPassword
                        isVisible={isVisiblePassword}
                        setIsVisible={() =>
                          setIsVisiblePassword((prev) => !prev)
                        }
                      />
                    </div>
                    <FormMessage className="pb-0" />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        {step === 2 && (
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
        )}
        <div className="flex flex-col gap-4">
          {step === 1 ? (
            <SubmitButton
              type="button"
              isSubmitting={isSubmitting}
              loadingText="Verificando..."
              onClick={handleNext}
            >
              Continuar
            </SubmitButton>
          ) : (
            <SubmitButton
              type="submit"
              isSubmitting={isSubmitting}
              loadingText="Creando cuenta..."
            >
              Crear cuenta
            </SubmitButton>
          )}
          <LastSessionButton />
          <SocialButtons isSubmitting={isSubmitting} />
        </div>
      </form>
      <FooterForm
        label="¿Ya tienes una cuenta?"
        link="/auth/login"
        linkText="Inicia sesión"
      />
    </Form>
  );
};

export default SignupForm;
