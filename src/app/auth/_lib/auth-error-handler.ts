import { AuthError } from "next-auth";

import {
  AUTH_ERROR_CODES,
  type AuthErrorCode,
  createAuthError,
  getAuthErrorMessage,
} from "@/lib/error-messages";

/**
 * Clase singleton para manejo centralizado de errores de autenticación
 * Proporciona métodos type-safe para identificar y manejar diferentes tipos de errores
 * que pueden ocurrir durante el proceso de autenticación con NextAuth.js
 */
export class AuthErrorHandler {
  private static instance: AuthErrorHandler;

  private constructor() {
    // Constructor privado para patrón Singleton
  }

  /**
   * Obtiene la instancia única de AuthErrorHandler (Singleton pattern)
   */
  public static getInstance(): AuthErrorHandler {
    if (!AuthErrorHandler.instance) {
      AuthErrorHandler.instance = new AuthErrorHandler();
    }
    return AuthErrorHandler.instance;
  }

  /**
   * Verifica si el error es un CallbackRouteError de NextAuth
   * Este tipo de error envuelve otros errores internos
   */
  private isCallbackRouteError(error: unknown): error is Error & {
    name: "CallbackRouteError";
    cause?: { err: Error; provider: string } | Error;
  } {
    return (
      error instanceof Error &&
      error.name === "CallbackRouteError" &&
      "cause" in error
    );
  }

  /**
   * Extrae el error real de la causa del CallbackRouteError
   */
  private extractErrorFromCause(cause: unknown): Error | null {
    // Si la causa es directamente un Error
    if (cause instanceof Error) {
      return cause;
    }

    // Si la causa es un objeto con propiedad 'err'
    if (
      typeof cause === "object" &&
      cause !== null &&
      "err" in cause &&
      (cause as any).err instanceof Error
    ) {
      return (cause as any).err;
    }

    return null;
  }

  /**
   * Verifica si el error es específicamente de credenciales inválidas
   */
  private isCredentialsError(error: unknown): error is Error & {
    message: "Invalid email or password";
  } {
    return (
      error instanceof Error && error.message === "Invalid email or password"
    );
  }

  /**
   * Verifica si el error es un AuthError de NextAuth
   */
  private isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }

  /**
   * Verifica si el error es de clave duplicada en la base de datos
   * Típicamente ocurre cuando se intenta crear un usuario con email existente
   */
  private isDuplicateKeyError(error: unknown): boolean {
    return (
      error instanceof Error &&
      error.message.includes("duplicate key") &&
      error.message.includes("users_email_key")
    );
  }

  /**
   * Maneja errores específicos del proceso de login
   * @param error - Error capturado durante el login
   * @param locale - Idioma para el mensaje de error (opcional)
   * @returns Estructura de error con código y mensaje
   */
  public handleLoginError(error: unknown, locale?: string) {
    // AuthError específicos de NextAuth
    if (this.isAuthError(error)) {
      if (error.type === "CredentialsSignin") {
        return createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS, locale);
      }
    }

    // CallbackRouteError que envuelve errores de credenciales
    if (this.isCallbackRouteError(error)) {
      const actualError = this.extractErrorFromCause(error.cause);

      if (actualError && this.isCredentialsError(actualError)) {
        return createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS, locale);
      }
    }

    // Error directo de credenciales inválidas
    if (this.isCredentialsError(error)) {
      return createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS, locale);
    }

    return createAuthError(AUTH_ERROR_CODES.UNKNOWN, locale);
  }

  /**
   * Maneja errores específicos del proceso de signup/registro
   * @param error - Error capturado durante el registro
   * @param locale - Idioma para el mensaje de error (opcional)
   * @returns Estructura de error con código y mensaje
   */
  public handleSignupError(error: unknown, locale?: string) {
    if (this.isAuthError(error)) {
      return createAuthError(AUTH_ERROR_CODES.INVALID_AUTH, locale);
    }

    if (this.isDuplicateKeyError(error)) {
      return createAuthError(AUTH_ERROR_CODES.DUPLICATE_EMAIL, locale);
    }

    return createAuthError(AUTH_ERROR_CODES.UNKNOWN, locale);
  }

  /**
   * Verifica si un código de error de signIn result corresponde a credenciales inválidas
   * @param errorCode - Código de error retornado por NextAuth signIn
   * @returns true si es error de credenciales
   */
  public isCredentialsSignInError(errorCode: string): boolean {
    return errorCode === "CredentialsSignin";
  }

  /**
   * Obtiene un mensaje de error por código específico
   * @param code - Código de error
   * @param locale - Idioma para el mensaje
   * @returns Mensaje de error localizado
   */
  public getErrorMessage(code: AuthErrorCode, locale?: string): string {
    return getAuthErrorMessage(code, locale);
  }

  /**
   * Códigos de error disponibles para referencia externa
   */
  public static readonly ERROR_CODES = AUTH_ERROR_CODES;
}
