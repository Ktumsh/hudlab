import {
  IconFileText,
  IconShieldLock,
  IconCookie,
  IconInfoCircle,
} from "@tabler/icons-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Información Legal | HUDLab",
  description: "Accede a los documentos y políticas legales de HUDLab.",
};

export default function LegalPage() {
  const links = [
    {
      href: "/legal/terms",
      label: "Términos y Condiciones",
      icon: IconFileText,
    },
    {
      href: "/legal/privacity",
      label: "Política de Privacidad",
      icon: IconShieldLock,
    },
    { href: "/legal/cookies", label: "Política de Cookies", icon: IconCookie },
    { href: "/legal/legal-notice", label: "Aviso Legal", icon: IconInfoCircle },
  ];
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-32 md:pt-14">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
        Información Legal
      </h1>
      <p className="text-base-content/70 mb-8">
        Encuentra los documentos que regulan el uso de la plataforma y cómo
        procesamos tus datos.
      </p>
      <ul
        className="grid gap-4 border-l-4"
        aria-label="Lista de documentos legales"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={buttonVariants({
              className:
                "hover:bg-primary/10 hover:text-primary flex items-center justify-start rounded-l-none border-0 bg-transparent text-left",
            })}
          >
            <l.icon className="mr-2 size-5" />
            {l.label}
          </Link>
        ))}
      </ul>
    </main>
  );
}
