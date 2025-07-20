import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const BackToLoginButton = () => {
  return (
    <Button variant="link" asChild>
      <Link href="/auth/login">
        <IconArrowLeft className="text-content-muted group-hover:text-base-content/80 size-5 transition-colors" />
        <span data-text="true" className="transition-inherit-all">
          Volver al inicio de sesión
        </span>
      </Link>
    </Button>
  );
};

export default BackToLoginButton;
