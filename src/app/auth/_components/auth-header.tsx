"use client";

import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import Logo from "@/components/logo";
import { BetterTooltip } from "@/components/ui/tooltip";

import AuthDecoration from "./auth-decoration";
import { useSignupForm } from "../_hooks/use-signup-form";

const AuthHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { email, step, setEmail, setStep } = useSignupForm();

  const isLoginPage = pathname === "/auth/login";
  const isSignupPage = pathname === "/auth/signup";

  useEffect(() => {
    setEmail("");
    setStep(1);
  }, [pathname, setEmail, setStep]);

  function getHeaderText(path: string, step: number, email: string) {
    if (path === "/auth/login") {
      return {
        header: "Accede a tu cuenta",
        subText: "Por favor, ingresa tus datos.",
      };
    }
    if (path === "/auth/signup") {
      return {
        header: "Crea una nueva cuenta",
        subText:
          step === 1 ? (
            "Ingresa tu correo o regístrate con Google"
          ) : (
            <>
              Continúas con:{" "}
              <span className="text-primary font-semibold">{email}</span>
            </>
          ),
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
        <BetterTooltip content="Ir al inicio" side="top">
          <Link href="/feed">
            <Logo width={56} height={56} className="relative z-2" />
          </Link>
        </BetterTooltip>
        <div className="from-primary/15 absolute top-1/2 left-1/2 size-80 -translate-1/2 rounded-full bg-radial to-transparent blur-3xl"></div>
      </div>
      <div className="z-10 flex max-w-90 flex-col gap-2 md:gap-3">
        <div className="z-10 flex flex-col gap-2 md:gap-3">
          <h1 className="text-neutral-content text-2xl font-semibold sm:text-3xl">
            {header}
          </h1>
          <p className="truncate">{subText}</p>
        </div>
      </div>
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
    </div>
  );
};

export default AuthHeader;
