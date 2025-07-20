import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Heading,
  Link,
  Button,
  Img,
  Hr,
  Preview,
} from "@react-email/components";

import { type BaseEmailProps, EMAIL_CONFIGS } from "@/config/email.config";

interface EmailTemplateProps extends BaseEmailProps {
  companyLogo?: string;
  supportEmail?: string;
  unsubscribeUrl?: string;
}

export default function EmailTemplate({
  username,
  verificationCode,
  type,
  customContent,
  actionUrl,
  expirationTime = "10 minutos",
  companyLogo = "https://hudlab.vercel.app/logo/HUDLab-logo.webp",
  supportEmail = "soporte@hudlab.com",
  unsubscribeUrl,
}: EmailTemplateProps) {
  const config = EMAIL_CONFIGS[type];
  const isPasswordReset = type === "password-reset";

  const formatVerificationCode = (code: string) => {
    return code.split("").join(" ");
  };

  return (
    <Html>
      <Head />
      <Preview>{config.previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Row>
              <Column align="left">
                <Img
                  src={companyLogo}
                  width="120"
                  height="40"
                  alt="HUDLab"
                  style={logo}
                />
                <Heading style={headerTitle}>¡Hola, {username}!</Heading>
              </Column>
            </Row>
          </Section>

          {/* Content Section */}
          <Section style={content}>
            <Text style={description}>{config.description}</Text>

            {/* Custom Content */}
            {customContent && (
              <Section style={customContentSection}>
                <Text style={customContentText}>{customContent}</Text>
              </Section>
            )}

            {/* Verification Code Section - Solo para tipos que no sean password-reset */}
            {!isPasswordReset && (
              <Section style={verificationSection}>
                <Text style={verificationLabel}>CÓDIGO DE VERIFICACIÓN</Text>
                <Text style={verificationCodeStyle}>
                  {formatVerificationCode(verificationCode)}
                </Text>
                <Text style={verificationNote}>
                  Ingresa este código en la aplicación
                </Text>
              </Section>
            )}

            {/* Action Button */}
            {actionUrl && (
              <Section style={buttonSection}>
                <Button style={button} href={actionUrl}>
                  {config.actionText}
                </Button>
              </Section>
            )}

            {/* Fallback Link Section */}
            {actionUrl && (
              <Section style={fallbackLinkSection}>
                <Text style={fallbackText}>
                  ¿No funciona el botón? Copia y pega este enlace:
                </Text>
                <Text style={fallbackLink}>
                  <Link href={actionUrl} style={linkStyle}>
                    {actionUrl}
                  </Link>
                </Text>
              </Section>
            )}
          </Section>

          {/* Footer Section */}
          <Section style={footer}>
            {/* Expiration Notice */}
            <Section style={expirationSection}>
              <Text style={expirationText}>
                <strong>Importante:</strong> Este{" "}
                {isPasswordReset ? "enlace" : "código"} expirará en{" "}
                {expirationTime}. Si no lo usas dentro de este tiempo, deberás
                solicitar uno nuevo.
              </Text>
            </Section>

            {config.footerText && (
              <Text style={footerText}>{config.footerText}</Text>
            )}

            <Text style={footerLinks}>
              <Link href={`mailto:${supportEmail}`} style={footerLink}>
                Soporte
              </Link>
              {" • "}
              <Link href="https://hudlab.com/privacy" style={footerLink}>
                Privacidad
              </Link>
              {" • "}
              <Link href="https://hudlab.com/terms" style={footerLink}>
                Términos
              </Link>
              {unsubscribeUrl && (
                <>
                  {" • "}
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Cancelar suscripción
                  </Link>
                </>
              )}
            </Text>

            <Hr style={hr} />

            <Text style={brandName}>HUDLab ©2025</Text>
            <Text style={brandTagline}>
              La comunidad definitiva para diseñadores de HUDs
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos usando objetos JavaScript (React Email style)
const main = {
  backgroundColor: "#fff",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  margin: "0 auto",
  maxWidth: "780px",
  backgroundColor: "#000000",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
};

const header = {
  padding: "80px 80px 0px 80px",
  textAlign: "left" as const,
  position: "relative" as const,
};

const logo = {
  width: "88px",
  height: "88px",
  margin: "0 auto 16px 0",
  display: "block",
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "36px",
  fontWeight: "700",
  margin: "0",
};

const content = {
  padding: "20px 80px 80px 80px",
};

const description = {
  fontSize: "18px",
  color: "#d6d6d6",
  margin: "0 0 32px 0",
  lineHeight: "1.7",
};

const customContentSection = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: "4px solid #667eea",
};

const customContentText = {
  fontSize: "14px",
  color: "#374151",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const verificationSection = {
  background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
  border: "2px dashed #374151",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const verificationLabel = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#9ca3af",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const verificationCodeStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#67e8f9",
  fontFamily: "'Courier New', monospace",
  letterSpacing: "8px",
  margin: "8px 0",
  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
};

const verificationNote = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "8px 0 0 0",
};

const buttonSection = {
  backgroundColor: "#141414",
  padding: "32px 16px",
  textAlign: "center" as const,
  margin: "24px 0 0 0",
};

const button = {
  background: "linear-gradient(90deg, #67e8f9 0%, #38bdf8 100%)",
  color: "#083344",
  textDecoration: "none",
  padding: "16px 32px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "18px",
  display: "inline-block",
  border: "none",
};

const expirationSection = {
  backgroundColor: "#fff",
  padding: "16px",
  margin: "0 0 32px 0",
};

const expirationText = {
  color: "#374151",
  fontSize: "16px",
  margin: "0",
};

const footer = {
  backgroundColor: "#fff",
  padding: "32px 0",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 16px 0",
};

const footerLinks = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 24px 0",
};

const footerLink = {
  color: "#667eea",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const brandName = {
  fontWeight: "700",
  color: "#667eea",
  fontSize: "16px",
  margin: "0 0 4px 0",
};

const brandTagline = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0",
};

const fallbackLinkSection = {
  padding: "24px 0",
  margin: "16px 0",
  textAlign: "center" as const,
};

const fallbackText = {
  fontSize: "18px",
  color: "#d6d6d6",
  margin: "0 0 8px 0",
  fontWeight: "400",
};

const fallbackLink = {
  fontSize: "16px",
  margin: "0",
  wordBreak: "break-all" as const,
};

const linkStyle = {
  color: "#67e8f9",
  textDecoration: "underline",
};
