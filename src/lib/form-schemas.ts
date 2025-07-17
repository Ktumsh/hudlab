import { z } from "zod";

import { formErrors } from "./form-errors";

const displayNameRegex = /^[\p{L}\p{M}\p{N}\p{P}\p{S}\p{Zs}]+$/u;
/* const usernameRegex = /^[A-Za-z0-9_]+$/; */
/* const bioRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,!?¡¿'"-]*$/; */

export const signupSchema = z.object({
  email: z.email({
    message: formErrors.required.email,
  }),
  displayName: z
    .string()
    .min(1, { message: formErrors.length.displayNameMin })
    .max(50, { message: formErrors.length.displayNameMax })
    .regex(displayNameRegex, { message: formErrors.invalid.displayName }),
  password: z
    .string()
    .min(8, { message: formErrors.length.passwordMin })
    .regex(/[A-Z]/, { message: formErrors.password.noUppercase })
    .regex(/[a-z]/, { message: formErrors.password.noLowercase })
    .regex(/[0-9]/, { message: formErrors.password.noNumber })
    .regex(/[^A-Za-z0-9]/, { message: formErrors.password.noSymbol }),
});

export type SignupFormData = z.infer<typeof signupSchema>;

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export const loginSchema = z.object({
  email: z.string().regex(emailRegex, { message: formErrors.invalid.email }),
  password: z.string().min(1, { message: formErrors.required.password }),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ message: formErrors.required.email }),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: formErrors.length.passwordMin })
      .regex(/[^A-Za-z0-9]/, {
        message: formErrors.password.noSymbol,
      })
      .regex(/[0-9]/, { message: formErrors.password.noNumber })
      .regex(/[a-z]/, { message: formErrors.password.noLowercase })
      .regex(/[A-Z]/, { message: formErrors.password.noUppercase }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: formErrors.password.mismatch,
    path: ["confirmPassword"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
