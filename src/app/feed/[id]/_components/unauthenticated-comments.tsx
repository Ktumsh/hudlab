"use client";

import { IconMessageCircle } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";

const UnauthenticatedComments = () => {
  const pathname = usePathname();
  return (
    <div className="bg-base-200/50 mt-4 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center">
      <IconMessageCircle className="text-content-muted mb-1 size-10" />
      <h3 className="text-base-content text-lg font-semibold">
        ¿Quieres comentar o ver feedback de otros miembros de la comunidad?
      </h3>
      <span className="text-base-content/80 max-w-xl text-sm">
        <span className="text-base-content font-medium">Inicia sesión</span> o{" "}
        <span className="text-base-content font-medium">crea una cuenta</span>{" "}
        para compartir tus ideas, inspirarte y analizar interfaces junto a la
        comunidad de
        <div className="relative ms-8 inline">
          <Logo size={24} className="absolute -top-0.5 -left-7 size-6" />
          <span className="text-base-content font-medium">HUDLab.</span>
        </div>
      </span>
      <div className="mt-2 flex gap-2">
        <Button asChild className="bg-base-200 hover:bg-base-300">
          <a href={`/auth/login?next=${pathname}`}>Iniciar sesión</a>
        </Button>
        <Button asChild variant="primary">
          <Link href="/auth/signup">Registrarse</Link>
        </Button>
      </div>
    </div>
  );
};

export default UnauthenticatedComments;
