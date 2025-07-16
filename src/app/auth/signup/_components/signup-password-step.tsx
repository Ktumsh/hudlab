"use client";

import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { useState } from "react";

import { ButtonPassword } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { SignupFormData } from "@/lib/form-schemas";
import type { Control } from "react-hook-form";

interface SignupPasswordStepProps {
  control: Control<SignupFormData>;
  watch: (name: string) => string;
}
const SignupPasswordStep = ({ control, watch }: SignupPasswordStepProps) => {
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  const pwd = watch("password");

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

  return (
    <>
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={isVisiblePassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                />
                <ButtonPassword
                  isVisible={isVisiblePassword}
                  setIsVisible={() => setIsVisiblePassword((prev) => !prev)}
                />
              </div>
            </FormControl>
            <ul className="space-y-1 text-sm">
              {requirements.map(({ label, valid }) => (
                <li
                  key={label}
                  className={cn(
                    "text-error flex items-center gap-2",
                    valid && "text-green-400",
                  )}
                >
                  {valid ? (
                    <IconCircleCheck className="size-4" />
                  ) : (
                    <IconCircleX className="size-4" />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar contraseña</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={isVisibleConfirm ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  className={
                    watch("password") === field.value && field.value
                      ? "border-green-600"
                      : ""
                  }
                />
                <ButtonPassword
                  isVisible={isVisibleConfirm}
                  setIsVisible={() => setIsVisibleConfirm((prev) => !prev)}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SignupPasswordStep;
