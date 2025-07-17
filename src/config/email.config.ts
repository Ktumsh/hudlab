export type EmailType =
  | "verification"
  | "password-reset"
  | "email-change"
  | "welcome"
  | "notification";

export interface BaseEmailProps {
  username: string;
  verificationCode: string;
  type: EmailType;
  customContent?: string;
  actionUrl?: string;
  expirationTime?: string;
}

export interface EmailTemplateConfig {
  subject: string;
  title: string;
  description: string;
  actionText: string;
  footerText?: string;
  previewText: string;
}

export const EMAIL_CONFIGS: Record<EmailType, EmailTemplateConfig> = {
  verification: {
    subject: "Verifica tu cuenta en HUDLab",
    title: "¡Bienvenido a HUDLab!",
    description:
      "Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.",
    actionText: "Verificar cuenta",
    footerText:
      "Si no creaste una cuenta en HUDLab, puedes ignorar este correo.",
    previewText: "Verifica tu cuenta para comenzar a explorar HUDs increíbles",
  },
  "password-reset": {
    subject: "Restablece tu contraseña - HUDLab",
    title: "Restablece tu contraseña",
    description:
      "Recibimos una solicitud para restablecer la contraseña de tu cuenta.",
    actionText: "Restablecer contraseña",
    footerText: "Si no solicitaste este cambio, puedes ignorar este correo.",
    previewText: "Restablece tu contraseña de forma segura",
  },
  "email-change": {
    subject: "Confirma tu nuevo correo electrónico - HUDLab",
    title: "Confirma tu nuevo correo",
    description:
      "Para completar el cambio de tu dirección de correo electrónico, confirma tu nueva dirección.",
    actionText: "Confirmar correo",
    footerText:
      "Si no solicitaste este cambio, contacta con soporte inmediatamente.",
    previewText: "Confirma tu nueva dirección de correo electrónico",
  },
  welcome: {
    subject: "¡Bienvenido a HUDLab!",
    title: "¡Tu cuenta está lista!",
    description:
      "Gracias por unirte a la comunidad de diseñadores y entusiastas de HUDs.",
    actionText: "Explorar HUDLab",
    footerText: "Esperamos ver tus increíbles capturas de HUDs.",
    previewText: "¡Bienvenido a la comunidad de HUDLab!",
  },
  notification: {
    subject: "Nueva actividad en HUDLab",
    title: "Tienes nueva actividad",
    description: "Hay nuevas interacciones en tu contenido.",
    actionText: "Ver actividad",
    footerText: "Puedes gestionar tus notificaciones en la configuración.",
    previewText: "Tienes nueva actividad en HUDLab",
  },
};
