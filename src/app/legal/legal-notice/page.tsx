import LegalLayout from "../_components/legal-layout";

import {
  buildSections,
  LEGAL_LAST_UPDATED,
  legalPages,
} from "@/config/legal.config";

export const metadata = {
  title: `${legalPages.legalNotice.titleEs} | HUDLab`,
  description: "Información legal general y detalles de titularidad.",
};

export default function LegalNoticePage() {
  const sections = buildSections("legalNotice");
  return (
    <LegalLayout
      title="Aviso Legal"
      breadcrumbLabel={legalPages.legalNotice.titleEs}
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={sections}
    />
  );
}
