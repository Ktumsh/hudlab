"use client";

import { IconKey, IconLock } from "@tabler/icons-react";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import Logo from "@/components/logo";
import { BetterTooltip } from "@/components/ui/tooltip";

import AuthDecoration from "./auth-decoration";
import { useAuthForm } from "../_hooks/use-auth-form";

const AuthHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { email, step, setEmail, setStep } = useAuthForm();

  const isLoginPage = pathname === "/auth/login";
  const isSignupPage = pathname === "/auth/signup";
  const isForgotPasswordPage = pathname === "/auth/forgot-password";
  const isResetPasswordPage = pathname === "/auth/reset-password";

  useEffect(() => {
    setEmail("");
    setStep(1);
  }, [pathname, setEmail, setStep]);

  function getHeaderText(path: string, step: number, email: string) {
    if (path === "/auth/login") {
      return {
        header: "Accede a tu cuenta",
        subText: "¡Continúa explorando diseños gaming!",
      };
    }
    if (path === "/auth/signup") {
      return {
        header: "Crea una nueva cuenta",
        subText:
          step === 1 ? (
            "Completa tus datos o accede rápidamente"
          ) : (
            <>
              Continúas con:{" "}
              <span className="text-primary font-semibold">{email}</span>
            </>
          ),
      };
    }
    if (path === "/auth/forgot-password") {
      return {
        header: step === 1 ? "¿Olvidaste tu contraseña?" : "Revisa tu correo",
        subText:
          step === 1 ? (
            "No te preocupes, te ayudaremos a recuperarla"
          ) : (
            <>
              Enviamos un enlace de recuperación a:{" "}
              <span className="text-primary font-semibold">{email}</span>
            </>
          ),
      };
    }
    if (path === "/auth/reset-password") {
      return {
        header: "Restablecer contraseña",
        subText:
          "Tu nueva contraseña debe ser diferente a las contraseñas utilizadas anteriormente",
      };
    }
    return {
      header: "",
      subText: "",
    };
  }

  const { header, subText } = getHeaderText(pathname, step, email);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative">
        <AuthDecoration />
        {(isLoginPage || isSignupPage) && (
          <BetterTooltip content="Ir al inicio" side="top">
            <Link href="/feed">
              <Logo width={56} height={56} className="relative z-2" />
            </Link>
          </BetterTooltip>
        )}
        {isForgotPasswordPage ? (
          <div className="bg-base-100/50 rounded-box relative z-2 flex size-14 shrink-0 items-center justify-center border shadow-xs backdrop-blur">
            <IconKey className="size-7" />
          </div>
        ) : (
          isResetPasswordPage && (
            <div className="bg-base-100/50 rounded-box relative z-2 flex size-14 shrink-0 items-center justify-center border shadow-xs backdrop-blur">
              <IconLock className="size-7" />
            </div>
          )
        )}
        <div
          aria-hidden="true"
          className="from-primary/15 absolute top-1/2 left-1/2 size-80 -translate-1/2 rounded-full bg-radial to-transparent blur-3xl"
        />
      </div>
      <div className="z-10 flex flex-col gap-2 md:gap-3">
        <h1 className="text-neutral-content text-2xl font-semibold sm:text-3xl">
          {header}
        </h1>
        <p>{subText}</p>
      </div>
      {(isSignupPage || isLoginPage) && (
        <div className="z-10 flex w-full flex-col">
          <LayoutGroup>
            <div className="group rounded-field bg-base-100 flex gap-0.5 border">
              <button
                onClick={() => router.push("/auth/signup")}
                className="rounded-field relative h-9 flex-1 text-sm font-semibold"
              >
                {isSignupPage && (
                  <motion.div
                    layoutId="active-auth-button"
                    className="rounded-field bg-base-300 hover:bg-base-300 absolute inset-0 z-0 border transition-colors"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-1">Registrarse</span>
              </button>
              <button
                onClick={() => router.push("/auth/login")}
                className="rounded-field relative h-9 flex-1 text-sm font-semibold"
              >
                {isLoginPage && (
                  <motion.div
                    layoutId="active-auth-button"
                    className="rounded-field bg-base-300 hover:bg-base-300 absolute inset-0 z-0 border transition-colors"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-1">Iniciar sesión</span>
              </button>
            </div>
          </LayoutGroup>
        </div>
      )}
    </div>
  );
};

export default AuthHeader;
