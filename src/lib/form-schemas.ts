import { z } from "zod";

import { formErrors as e } from "./form-errors";

const displayNameRegex = /^[\p{L}\p{M}\p{N}\p{P}\p{S}\p{Zs}]+$/u;
const usernameRegex = /^[A-Za-z0-9_]+$/;
/* const bioRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,!?¡¿'"-]*$/; */

export const signupSchema = z.object({
  email: z.email({
    error: e.required.email,
  }),
  displayName: z
    .string()
    .min(1, { error: e.length.displayNameMin })
    .max(50, { error: e.length.displayNameMax })
    .regex(displayNameRegex, { error: e.invalid.displayName }),
  password: z
    .string()
    .min(8, { error: e.length.passwordMin })
    .regex(/[A-Z]/, { error: e.password.noUppercase })
    .regex(/[a-z]/, { error: e.password.noLowercase })
    .regex(/[0-9]/, { error: e.password.noNumber })
    .regex(/[^A-Za-z0-9]/, { error: e.password.noSymbol }),
});

export type SignupFormData = z.infer<typeof signupSchema>;

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export const loginSchema = z.object({
  email: z.string().regex(emailRegex, { error: e.invalid.email }),
  password: z.string().min(1, { error: e.required.password }),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: e.required.email }),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: e.length.passwordMin })
      .regex(/[^A-Za-z0-9]/, {
        error: e.password.noSymbol,
      })
      .regex(/[0-9]/, { error: e.password.noNumber })
      .regex(/[a-z]/, { error: e.password.noLowercase })
      .regex(/[A-Z]/, { error: e.password.noUppercase }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: e.password.mismatch,
    path: ["confirmPassword"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, { error: e.required.collectionName })
    .max(100, { error: e.length.collectionNameMax }),
  description: z
    .string()
    .max(200, { error: e.length.collectionDescriptionMax })
    .optional(),
  visibility: z.enum(["public", "private"]),
});

export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;

// ─────────────────────────────
// 👤 PROFILE UPDATE
// ─────────────────────────────
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, { error: e.length.displayNameMin })
    .max(50, { error: e.length.displayNameMax }),
  username: z
    .string()
    .min(3, { error: e.length.usernameMin })
    .max(20, { error: e.length.usernameMax })
    .regex(usernameRegex, { error: e.invalid.username }),
  bio: z
    .string()
    .max(150, { error: e.length.bioMax })
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// ─────────────────────────────
// 📸 UPLOAD CREATION
// ─────────────────────────────
export const createUploadSchema = z.object({
  title: z
    .string()
    .min(1, { error: e.required.uploadTitle })
    .max(150, { error: e.length.uploadTitleMax }),
  description: z
    .string()
    .max(500, { error: e.length.uploadDescriptionMax })
    .optional()
    .or(z.literal("")),
  gameId: z.string().min(1, { error: e.required.game }),
  type: z.string().min(1, { error: e.required.uploadType }),
  tags: z
    .string()
    .max(200, { error: e.length.tagsMax })
    .optional()
    .or(z.literal("")),
  // images se excluye del esquema; el backend valida y el payload se arma en el submit
});

export type CreateUploadFormData = z.infer<typeof createUploadSchema>;
