import { z } from "zod";

import { formErrors } from "./form-errors";

const displayNameRegex = /^[\p{L}\p{M}\p{N}\p{P}\p{S}\p{Zs}]+$/u;
/* const usernameRegex = /^[A-Za-z0-9_]+$/; */
/* const bioRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,!?¡¿'"-]*$/; */

export const signupSchema = z.object({
  email: z.email({
    error: formErrors.required.email,
  }),
  displayName: z
    .string()
    .min(1, { error: formErrors.length.displayNameMin })
    .max(50, { error: formErrors.length.displayNameMax })
    .regex(displayNameRegex, { error: formErrors.invalid.displayName }),
  password: z
    .string()
    .min(8, { error: formErrors.length.passwordMin })
    .regex(/[A-Z]/, { error: formErrors.password.noUppercase })
    .regex(/[a-z]/, { error: formErrors.password.noLowercase })
    .regex(/[0-9]/, { error: formErrors.password.noNumber })
    .regex(/[^A-Za-z0-9]/, { error: formErrors.password.noSymbol }),
});

export type SignupFormData = z.infer<typeof signupSchema>;

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export const loginSchema = z.object({
  email: z.string().regex(emailRegex, { error: formErrors.invalid.email }),
  password: z.string().min(1, { error: formErrors.required.password }),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: formErrors.required.email }),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: formErrors.length.passwordMin })
      .regex(/[^A-Za-z0-9]/, {
        error: formErrors.password.noSymbol,
      })
      .regex(/[0-9]/, { error: formErrors.password.noNumber })
      .regex(/[a-z]/, { error: formErrors.password.noLowercase })
      .regex(/[A-Z]/, { error: formErrors.password.noUppercase }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: formErrors.password.mismatch,
    path: ["confirmPassword"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, { error: formErrors.required.collectionName })
    .max(100, { error: formErrors.length.collectionNameMax }),
  description: z
    .string()
    .max(200, { error: formErrors.length.collectionDescriptionMax })
    .optional(),
  visibility: z.enum(["public", "private"]),
});

export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;
