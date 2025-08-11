import LegalLayout from "../_components/legal-layout";

import {
  buildSections,
  LEGAL_LAST_UPDATED,
  legalPages,
} from "@/config/legal.config";

export const metadata = {
  title: `${legalPages.terms.titleEs} | HUDLab`,
  description: "Normas que regulan el uso de la plataforma HUDLab.",
};

export default function TermsPage() {
  const sections = buildSections("terms");
  return (
    <LegalLayout
      title="Términos y Condiciones"
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={sections}
    />
  );
}
