/**
 * Códigos de error estandarizados para autenticación
 * Estos códigos se mapean a mensajes específicos en diferentes idiomas
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  DUPLICATE_EMAIL: "AUTH_DUPLICATE_EMAIL",
  INVALID_AUTH: "AUTH_INVALID_AUTH",
  UNKNOWN: "AUTH_UNKNOWN_ERROR",
  OAUTH_CALLBACK_ERROR: "AUTH_OAUTH_CALLBACK_ERROR",
  PROVIDER_ERROR: "AUTH_PROVIDER_ERROR",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * Mapeo de códigos de error a mensajes de usuario
 * Esto permite fácil internacionalización y mantenimiento
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: "Invalid email or password",
  [AUTH_ERROR_CODES.DUPLICATE_EMAIL]: "Email already exists",
  [AUTH_ERROR_CODES.INVALID_AUTH]: "Invalid credentials",
  [AUTH_ERROR_CODES.UNKNOWN]: "An unknown error occurred",
  [AUTH_ERROR_CODES.OAUTH_CALLBACK_ERROR]:
    "Authentication failed. Please try again",
  [AUTH_ERROR_CODES.PROVIDER_ERROR]: "Provider authentication error",
};

/**
 * Mapeo de códigos de error a mensajes en español
 * Ejemplo de cómo sería la internacionalización
 */
export const AUTH_ERROR_MESSAGES_ES: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: "Email o contraseña inválidos",
  [AUTH_ERROR_CODES.DUPLICATE_EMAIL]: "El email ya existe",
  [AUTH_ERROR_CODES.INVALID_AUTH]: "Credenciales inválidas",
  [AUTH_ERROR_CODES.UNKNOWN]: "Ocurrió un error desconocido",
  [AUTH_ERROR_CODES.OAUTH_CALLBACK_ERROR]:
    "Autenticación fallida. Inténtalo de nuevo",
  [AUTH_ERROR_CODES.PROVIDER_ERROR]: "Error de autenticación del proveedor",
};

/**
 * Función para obtener el mensaje de error según el idioma
 */
export function getAuthErrorMessage(
  code: AuthErrorCode,
  locale: string = "en",
): string {
  const messages =
    locale === "es" ? AUTH_ERROR_MESSAGES_ES : AUTH_ERROR_MESSAGES;
  return messages[code] || messages[AUTH_ERROR_CODES.UNKNOWN];
}

/**
 * Función para crear un error estructurado con código y mensaje
 */
export function createAuthError(code: AuthErrorCode, locale?: string) {
  return {
    code,
    message: getAuthErrorMessage(code, locale),
    timestamp: new Date().toISOString(),
  };
}
