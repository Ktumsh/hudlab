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
              <Column align="center">
                <Img
                  src={companyLogo}
                  width="120"
                  height="40"
                  alt="HUDLab"
                  style={logo}
                />
                <Heading style={headerTitle}>{config.title}</Heading>
              </Column>
            </Row>
          </Section>

          {/* Content Section */}
          <Section style={content}>
            <Text style={greeting}>¡Hola, {username}!</Text>
            <Text style={description}>{config.description}</Text>

            {/* Custom Content */}
            {customContent && (
              <Section style={customContentSection}>
                <Text style={customContentText}>{customContent}</Text>
              </Section>
            )}

            {/* Verification Code Section */}
            <Section style={verificationSection}>
              <Text style={verificationLabel}>CÓDIGO DE VERIFICACIÓN</Text>
              <Text style={verificationCodeStyle}>
                {formatVerificationCode(verificationCode)}
              </Text>
              <Text style={verificationNote}>
                Ingresa este código en la aplicación
              </Text>
            </Section>

            {/* Action Button */}
            {actionUrl && (
              <Section style={buttonSection}>
                <Button style={button} href={actionUrl}>
                  {config.actionText}
                </Button>
              </Section>
            )}

            {/* Expiration Notice */}
            <Section style={expirationSection}>
              <Text style={expirationText}>
                <strong>⏰ Importante:</strong> Este código expirará en{" "}
                {expirationTime}. Si no lo usas dentro de este tiempo, deberás
                solicitar uno nuevo.
              </Text>
            </Section>
          </Section>

          {/* Footer Section */}
          <Section style={footer}>
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

            <Text style={brandName}>HUDLab</Text>
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
  backgroundColor: "#f9fafb",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
};

const header = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "32px 24px",
  textAlign: "center" as const,
  position: "relative" as const,
};

const logo = {
  margin: "0 auto 16px auto",
  display: "block",
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const content = {
  padding: "40px 32px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 24px 0",
};

const description = {
  fontSize: "16px",
  color: "#4b5563",
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
  background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
  border: "2px dashed #9ca3af",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const verificationLabel = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#6b7280",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const verificationCodeStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1f2937",
  fontFamily: "'Courier New', monospace",
  letterSpacing: "8px",
  margin: "8px 0",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
};

const verificationNote = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "8px 0 0 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "#ffffff",
  textDecoration: "none",
  padding: "16px 32px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "16px",
  display: "inline-block",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const expirationSection = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  padding: "16px",
  borderRadius: "6px",
  margin: "24px 0",
};

const expirationText = {
  color: "#92400e",
  fontSize: "14px",
  margin: "0",
};

const footer = {
  backgroundColor: "#f9fafb",
  padding: "32px 24px",
  textAlign: "center" as const,
  borderTop: "1px solid #e5e7eb",
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
