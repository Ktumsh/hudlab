import LegalLayout from "../_components/legal-layout";

import {
  buildSections,
  LEGAL_LAST_UPDATED,
  legalPages,
} from "@/config/legal.config";

export const metadata = {
  title: `${legalPages.privacity.titleEs} | HUDLab`,
  description: "Cómo recogemos, usamos y protegemos tus datos en HUDLab.",
};

export default function PrivacyPage() {
  const sections = buildSections("privacity");
  return (
    <LegalLayout
      title="Política de Privacidad"
      breadcrumbLabel={legalPages.privacity.titleEs}
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={sections}
    />
  );
}
