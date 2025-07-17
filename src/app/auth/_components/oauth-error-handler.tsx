"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Componente para manejar errores de OAuth que vienen en los query params
 */
export const OAuthErrorHandler = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      let errorMessage = "Error al iniciar sesión";

      switch (error) {
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
          errorMessage =
            "Error de autenticación. Por favor, inténtalo de nuevo.";
          break;
        case "OAuthAccountNotLinked":
          errorMessage =
            "Este email ya está registrado con otro proveedor. Inicia sesión con el método original.";
          break;
        case "EmailSignin":
          errorMessage = "Error al enviar el email de verificación.";
          break;
        case "CredentialsSignin":
          errorMessage = "Email o contraseña incorrectos.";
          break;
        case "SessionRequired":
          errorMessage = "Debes iniciar sesión para acceder a esta página.";
          break;
        default:
          errorMessage =
            "Error inesperado al iniciar sesión. Inténtalo de nuevo.";
      }

      toast.error(errorMessage);

      // Limpiar el URL después de mostrar el error
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return null; // Este componente no renderiza nada
};

export default OAuthErrorHandler;
