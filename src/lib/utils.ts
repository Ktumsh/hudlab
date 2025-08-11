import { IconLink, IconMail, IconShare3 } from "@tabler/icons-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { ShareTarget } from "./types";

import {
  Discord,
  Facebook,
  Instagram,
  Messenger,
  Telegram,
  WhatsApp,
  XTwitter,
} from "@/components/icons/social";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getFirstName(fullName: string): string {
  if (!fullName) return "";

  const trimmed = fullName.trim();
  if (!trimmed) return "";

  const firstSpace = trimmed.indexOf(" ");
  return firstSpace > 0 ? trimmed.substring(0, firstSpace) : trimmed;
}

const enc = (v: string) => encodeURIComponent(v);

export function getShareTargets(opts: {
  isMobile: boolean;
  messengerAppId?: string;
  messengerRedirectUri?: string;
  copyToClipboard: (msg?: string) => Promise<void>;
  openNavigatorShare: () => Promise<void>;
}): ShareTarget[] {
  const {
    isMobile,
    messengerAppId,
    messengerRedirectUri,
    copyToClipboard,
    openNavigatorShare,
  } = opts;

  const messengerHref = (() => {
    if (isMobile) {
      return (p: { url?: string }) =>
        `fb-messenger://share/?link=${enc(p.url || "")}`;
    }
    if (messengerAppId && messengerRedirectUri) {
      return (p: { url?: string }) =>
        `https://www.facebook.com/dialog/send?link=${enc(p.url || "")}&app_id=${enc(
          messengerAppId,
        )}&redirect_uri=${enc(messengerRedirectUri)}`;
    }
    return () => `https://www.messenger.com/`;
  })();

  return [
    {
      id: "copy",
      label: "Copiar\nenlace",
      color: "bg-base-300",
      icon: IconLink,
      action: async () => copyToClipboard(),
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      color: "bg-[#00E676]",
      icon: WhatsApp,
      hrefBuilder: ({ title, text, url }) => {
        const msg = [title, text, url].filter(Boolean).join("\n\n");
        return `https://api.whatsapp.com/send?text=${enc(msg)}`;
      },
    },
    {
      id: "messenger",
      label: "Messenger",
      color: "bg-white",
      icon: Messenger,
      hrefBuilder: ({ url }) => messengerHref({ url }),
      action: async () =>
        copyToClipboard("Enlace copiado, pégalo en un chat de Messenger"),
    },
    {
      id: "facebook",
      label: "Facebook",
      color: "bg-blue-600",
      icon: Facebook,
      hrefBuilder: ({ title, text, url }) => {
        const u = enc(url || "");
        const quote = enc([title, text].filter(Boolean).join(" — "));
        return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${quote}`;
      },
    },
    {
      id: "x",
      label: "X",
      color: "bg-black",
      icon: XTwitter,
      hrefBuilder: ({ title, text, url }) => {
        const t = enc([title, text].filter(Boolean).join(" — "));
        const u = enc(url || "");
        return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
      },
    },
    {
      id: "telegram",
      label: "Telegram",
      color: "bg-white",
      icon: Telegram,
      hrefBuilder: ({ title, text, url }) => {
        const u = enc(url || "");
        const msg = enc([title, text].filter(Boolean).join("\n\n"));
        return `https://t.me/share/url?url=${u}&text=${msg}`;
      },
    },
    {
      id: "instagram",
      label: "Instagram",
      color:
        "bg-linear-to-tr/shorter from-10% from-[#FCB045] via-40% via-[#FD1D1D] to-[#833AB4] to-90%",
      icon: Instagram,
      hrefBuilder: () => `https://www.instagram.com/`,
      action: async () =>
        copyToClipboard("Enlace copiado, pégalo en un chat de Instagram"),
    },
    {
      id: "discord",
      label: "Discord",
      color: "bg-[#5865F2]",
      icon: Discord,
      hrefBuilder: () => "discord://discordapp.com/channels/@me",
      action: async () =>
        copyToClipboard("Enlace copiado, pégalo en un chat de Discord"),
    },
    {
      id: "email",
      label: "Email",
      color: "bg-stone-700",
      icon: IconMail,
      hrefBuilder: ({ title, text, url }) => {
        const subject = enc(title || "Te comparto esto");
        const body = enc([text, url].filter(Boolean).join("\n\n"));
        return `mailto:?subject=${subject}&body=${body}`;
      },
    },
    {
      id: "all",
      label: "Ver todo",
      color: "bg-base-300",
      icon: IconShare3,
      action: async () => openNavigatorShare(),
    },
  ];
}
