import LegalLayout from "../_components/legal-layout";

import {
  buildSections,
  LEGAL_LAST_UPDATED,
  legalPages,
} from "@/config/legal.config";

export const metadata = {
  title: `${legalPages.cookies.titleEs} | HUDLab`,
  description: "Uso de cookies y tecnologías similares en HUDLab.",
};

export default function CookiesPolicyPage() {
  const sections = buildSections("cookies");
  return (
    <LegalLayout
      title="Política de Cookies"
      breadcrumbLabel={legalPages.cookies.titleEs}
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={sections}
    />
  );
}
