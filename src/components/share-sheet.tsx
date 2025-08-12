"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, getShareTargets } from "@/lib/utils";

interface ShareSheetProps {
  sheetTitle?: string;
  title?: string;
  text?: string;
  url?: string;
  children: React.ReactNode;
}

const pickUrl = (fallback?: string) =>
  typeof window !== "undefined" && window.location?.href
    ? window.location.href
    : fallback || "https://example.com";

const copyFeedbackDuration = 1500;

const messengerAppId = process.env.NEXT_PUBLIC_MESSENGER_APP_ID;
const messengerRedirectUri = process.env.NEXT_PUBLIC_MESSENGER_REDIRECT_URI;

const ShareSheet = ({
  sheetTitle = "Compartir",
  title,
  text,
  url,
  children,
}: ShareSheetProps) => {
  const isMobile = useIsMobile();
  const shareUrl = url || pickUrl(url);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (successText?: string) => {
      try {
        if (!navigator.clipboard?.writeText) {
          toast.error("No se puede acceder al portapapeles en este navegador");
          return;
        }
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success(successText || "Enlace copiado");
        setTimeout(() => setCopied(false), copyFeedbackDuration);
      } catch (err) {
        console.error("copy failed", err);
        toast.error("No se pudo copiar el enlace");
      }
    },
    [shareUrl],
  );

  const openNavigatorShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (error) {
        console.error("Error al compartir:", error);
        toast.error("Error al compartir");
      }
    } else {
      toast.error("Compartir no es compatible con este navegador");
    }
  }, [title, text, shareUrl]);

  const openWindowCentered = useCallback(
    (href: string, width = 900, height = 700) => {
      if (isMobile) {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }

      const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
      const dualScreenTop = window.screenTop ?? window.screenY ?? 0;

      const winWidth =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        screen.width;
      const winHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        screen.height;

      const left = dualScreenLeft + (winWidth - width) / 2;
      const top = dualScreenTop + (winHeight - height) / 2;

      const features = `width=${width},height=${height},left=${Math.round(
        left,
      )},top=${Math.round(top)},scrollbars=yes,resizable=yes,noopener,noreferrer`;

      window.open(href, "sharePopup", features);
    },
    [isMobile],
  );

  const targets = useMemo(
    () =>
      getShareTargets({
        isMobile,
        messengerAppId,
        messengerRedirectUri,
        copyToClipboard,
        openNavigatorShare,
      }),
    [isMobile, copyToClipboard, openNavigatorShare],
  );

  /**
   * Precomputamos hrefs y handlers para evitar funciones inline en el map.
   * handlersMap: id -> handler
   */
  const handlersMap = useMemo(() => {
    const map = new Map<
      string,
      (e?: React.MouseEvent) => Promise<void> | void
    >();

    for (const t of targets) {
      const href = t.hrefBuilder
        ? t.hrefBuilder({ title, text, url: shareUrl })
        : null;

      const handler = async (e?: React.MouseEvent) => {
        // si existe evento, prevenimos navegación por defecto (el <a> tiene href)
        e?.preventDefault();

        // Ejecutar acción de pre-copy si existe (ej: copiar al portapapeles)
        if (t.action) {
          try {
            await t.action({ title, text, url: shareUrl });
          } catch (err) {
            console.error("error in target.action", err);
          }
        }

        if (!href || href === "#") return;

        // abrir popup o pestaña segura
        openWindowCentered(href);
      };

      map.set(t.id, handler);
    }

    return {
      map,
      hrefs: new Map(
        targets.map((t) => [
          t.id,
          t.hrefBuilder ? t.hrefBuilder({ title, text, url: shareUrl }) : null,
        ]),
      ),
    };
  }, [targets, title, text, shareUrl, openWindowCentered]);

  const tiles = (
    <div className="flex grid-cols-5 gap-5 overflow-x-auto p-6 md:grid md:gap-2 md:overflow-hidden md:p-0">
      {targets.map((t) => {
        const isCopy = t.id === "copy";
        const isAll = t.id === "all";
        const needsPreCopy =
          t.id === "instagram" || t.id === "messenger" || t.id === "discord";

        const Icon = isCopy && copied ? IconCheck : t.icon;
        const content = (
          <>
            <span
              className={cn(
                "border-border-muted relative flex size-10 items-center justify-center rounded-full",
                t.color,
                t.id === "x" && "border",
              )}
            >
              <Icon
                className={cn(
                  "size-6",
                  t.id === "facebook" && "size-10",
                  t.id === "discord" && "*:fill-white!",
                )}
              />
              {needsPreCopy && (
                <div className="absolute -right-1.5 -bottom-1.5 grid size-6 place-content-center rounded-full border bg-white text-black shadow-sm">
                  <IconCopy className="size-4" />
                </div>
              )}
            </span>

            <span className="text-xs leading-tight whitespace-nowrap md:whitespace-pre-line">
              {isCopy && copied ? "Enlace copiado" : t.label}
            </span>
          </>
        );

        // Si el target es sólo acción (copiar o "Ver todo"), renderizamos button sin href
        if (isCopy || isAll) {
          const handler =
            handlersMap.map.get(t.id) ??
            (() => t.action?.({ title, text, url: shareUrl }));
          return (
            <ShareTile
              key={t.id}
              id={t.id}
              content={content}
              onClick={(e) => handler(e)}
              ariaLabel={t.label.replace("\n", " ")}
              titleAttr={
                needsPreCopy
                  ? `Se copiará el enlace, luego pégalo en el chat de ${t.label}`
                  : undefined
              }
            />
          );
        }

        const href = handlersMap.hrefs.get(t.id) ?? null;
        const handler = handlersMap.map.get(t.id);

        return (
          <ShareTile
            key={t.id}
            id={t.id}
            content={content}
            href={href ?? undefined}
            onClick={(e) => handler?.(e)}
            ariaLabel={t.label}
            titleAttr={
              needsPreCopy
                ? `Se copiará el enlace, luego pégalo en el chat de ${t.label}`
                : undefined
            }
          />
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="mx-auto w-full max-w-md rounded-t-2xl">
          <DrawerHeader>
            <DrawerTitle>{sheetTitle}</DrawerTitle>
          </DrawerHeader>
          {tiles}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{sheetTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            Comparte este contenido en tus redes sociales.
          </DialogDescription>
        </DialogHeader>

        {tiles}
      </DialogContent>
    </Dialog>
  );
};

export default ShareSheet;

const ShareTile = memo(function ShareTile({
  id,
  content,
  href,
  ariaLabel,
  titleAttr,
  onClick,
}: {
  id: string;
  content: React.ReactNode;
  href?: string | null;
  ariaLabel?: string;
  titleAttr?: string;
  onClick?: (e: React.MouseEvent) => void | Promise<void>;
}) {
  if (href) {
    return (
      <a
        key={id}
        href={href}
        onClick={(e) => {
          onClick?.(e);
        }}
        className="rounded-box flex aspect-square min-w-16 flex-col items-center justify-center gap-2 transition md:min-w-auto"
        aria-label={ariaLabel}
        title={titleAttr}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      key={id}
      type="button"
      onClick={(e) => onClick?.(e)}
      className="rounded-box flex aspect-square min-w-16 flex-col items-center justify-center gap-2 md:min-w-auto"
      aria-label={ariaLabel}
      title={titleAttr}
    >
      {content}
    </button>
  );
});
