import type { LegalSection } from "../app/legal/_components/legal-layout";

export const LEGAL_LAST_UPDATED = "10 Ago 2025";

interface RawSection {
  id: string;
  titleEs: string;
  markdownEs: string;
}

interface LegalPageConfig {
  titleEs: string; // Título mostrado en la página
  sections: RawSection[]; // Secciones en español
}

export const legalPages: Record<string, LegalPageConfig> = {
  terms: {
    titleEs: "Términos y Condiciones",
    sections: [
      {
        id: "overview",
        titleEs: "Resumen",
        markdownEs:
          'Estos Términos y Condiciones ("Términos") regulan tu acceso y uso de la plataforma HUDLab (la "Plataforma"). Al crear una cuenta o usar la Plataforma aceptas estos Términos. Si no estás de acuerdo con alguna parte debes dejar de usar el servicio.',
      },
      {
        id: "purpose",
        titleEs: "Propósito",
        markdownEs:
          "HUDLab es una plataforma impulsada por la comunidad para descubrir, crear y gestionar HUDs y recursos relacionados con interfaces de juegos, además de colecciones generadas por usuarios.",
      },
      {
        id: "age",
        titleEs: "Requisitos de Edad",
        markdownEs:
          "Debes tener al menos 14 años o la edad mínima de consentimiento digital en tu jurisdicción. Si estás por debajo de la edad requerida necesitas autorización de un tutor.",
      },
      {
        id: "account",
        titleEs: "Seguridad de la Cuenta",
        markdownEs:
          "Eres responsable de proteger tus credenciales y toda actividad bajo tu cuenta. Podemos suspender o terminar cuentas por abuso o infracciones.",
      },
      {
        id: "user-content",
        titleEs: "Contenido de Usuario",
        markdownEs:
          'Al subir contenido ("Contenido de Usuario") confirmas que posees los derechos necesarios y otorgas a HUDLab una licencia mundial, no-exclusiva, revocable y sublicenciable para alojar, reproducir y mostrarlo para operar la Plataforma. Puedes eliminarlo; copias de respaldo pueden persistir un tiempo limitado.',
      },
      {
        id: "prohibited",
        titleEs: "Contenido Prohibido",
        markdownEs:
          "Se prohíbe contenido que infrinja derechos de terceros, contenga malware, sea ilegal, discriminatorio, acosador, sexualmente explícito, violento o promueva actividades peligrosas.",
      },
      {
        id: "licensing",
        titleEs: "Licencias y Propiedad",
        markdownEs:
          "Todos los derechos sobre la Plataforma y el software pertenecen a sus respectivos propietarios. No se concede ninguna licencia adicional más allá de lo necesario para usar el servicio bajo estos Términos.",
      },
      {
        id: "suspension",
        titleEs: "Suspensión",
        markdownEs:
          "Podemos suspender o limitar el acceso sin previo aviso si detectamos riesgos de seguridad, abuso, fraude o violaciones legales.",
      },
      {
        id: "changes",
        titleEs: "Cambios",
        markdownEs:
          "Podemos actualizar estos Términos. Los cambios materiales se anunciarán cuando sea viable. El uso continuado tras la fecha de vigencia implica aceptación.",
      },
      {
        id: "liability",
        titleEs: "Limitación de Responsabilidad",
        markdownEs:
          'La Plataforma se ofrece "tal cual" sin garantías. En la máxima medida permitida la responsabilidad agregada se limita a las tarifas pagadas en los 12 meses previos a una reclamación.',
      },
      {
        id: "law",
        titleEs: "Ley Aplicable",
        markdownEs:
          "Estos Términos se rigen por la legislación aplicable en tu jurisdicción, sin atender a principios de conflicto de leyes.",
      },
    ],
  },
  privacity: {
    titleEs: "Política de Privacidad",
    sections: [
      {
        id: "data-collected",
        titleEs: "Datos que Recogemos",
        markdownEs:
          "**Cuenta:** email, nombre de perfil, avatar.\n\n**Uso:** páginas visitadas, interacciones, búsquedas.\n\n**Contenido:** HUDs, colecciones, comentarios y metadatos.\n\n**Cookies y tecnología similar:** sesión, analítica, preferencias.",
      },
      {
        id: "purposes",
        titleEs: "Finalidades",
        markdownEs:
          "- Proporcionar y mejorar la Plataforma.\n- Personalizar experiencia y recomendaciones.\n- Seguridad, prevención de fraude y abuso.\n- Comunicaciones esenciales del servicio.\n- Cumplimiento legal.",
      },
      {
        id: "legal-bases",
        titleEs: "Bases Legales",
        markdownEs:
          "Según la jurisdicción: ejecución de contrato, consentimiento (ciertas cookies), intereses legítimos (mejoras y seguridad) y obligaciones legales.",
      },
      {
        id: "retention",
        titleEs: "Conservación",
        markdownEs:
          "Conservamos los datos mientras tu cuenta esté activa y después solo lo necesario para obligaciones legales o resolver disputas.",
      },
      {
        id: "sharing",
        titleEs: "Compartición",
        markdownEs:
          "Usamos encargados (hosting, analítica) bajo contratos con medidas de protección. No vendemos datos personales.",
      },
      {
        id: "rights",
        titleEs: "Tus Derechos",
        markdownEs:
          "Acceder, rectificar, eliminar, limitar u oponerse al tratamiento y portabilidad cuando aplique. Contacta con soporte para ejercerlos.",
      },
      {
        id: "security",
        titleEs: "Seguridad",
        markdownEs:
          "Aplicamos medidas técnicas y organizativas razonables. Ningún sistema es 100% seguro; notificaremos incidentes conforme a la ley.",
      },
      {
        id: "cookies",
        titleEs: "Cookies",
        markdownEs:
          "Consulta la Política de Cookies para detalles sobre tecnologías de seguimiento y opciones.",
      },
      {
        id: "changes",
        titleEs: "Cambios",
        markdownEs:
          "Las actualizaciones aparecerán aquí. El uso continuado tras cambios implica aceptación.",
      },
    ],
  },
  cookies: {
    titleEs: "Política de Cookies",
    sections: [
      {
        id: "what",
        titleEs: "Qué Son las Cookies",
        markdownEs:
          "Pequeños archivos de texto que se almacenan en tu dispositivo para recordar información sobre tu visita. También usamos almacenamiento similar como localStorage.",
      },
      {
        id: "types",
        titleEs: "Tipos que Usamos",
        markdownEs:
          "**Esenciales:** sesión de autenticación y funciones básicas.\n\n**Preferencias:** recuerda filtros y configuraciones.\n\n**Analítica:** ayuda a entender el uso agregado.",
      },
      {
        id: "control",
        titleEs: "Control",
        markdownEs:
          "Puedes bloquear o eliminar cookies en la configuración del navegador. Algunas funciones pueden fallar si se desactivan las esenciales.",
      },
      {
        id: "changes",
        titleEs: "Cambios",
        markdownEs:
          "Actualizaremos esta lista si cambia nuestro uso de cookies.",
      },
    ],
  },
  legalNotice: {
    titleEs: "Aviso Legal",
    sections: [
      {
        id: "ownership",
        titleEs: "Titularidad",
        markdownEs:
          "HUDLab es un proyecto digital. Contacto principal: support@hudlab.app.",
      },
      {
        id: "ip",
        titleEs: "Propiedad Intelectual",
        markdownEs:
          "Logos, marcas y signos distintivos pertenecen a sus propietarios. El contenido generado por usuarios es responsabilidad exclusiva de sus autores.",
      },
      {
        id: "links",
        titleEs: "Enlaces Externos",
        markdownEs:
          "Pueden aparecer enlaces de terceros. No somos responsables del contenido externo.",
      },
      {
        id: "availability",
        titleEs: "Disponibilidad",
        markdownEs:
          "Buscamos continuidad y calidad pero no podemos garantizar operación ininterrumpida o libre de errores.",
      },
      {
        id: "misuse",
        titleEs: "Uso Indebido / Abuso",
        markdownEs:
          "Intentos de explotación, scraping masivo o interferencia de seguridad pueden resultar en bloqueo inmediato y posible aviso a autoridades.",
      },
    ],
  },
};

export function buildSections(key: keyof typeof legalPages): LegalSection[] {
  const page = legalPages[key];
  return page.sections.map((s) => ({
    id: s.id,
    title: s.titleEs,
    content: s.markdownEs,
  }));
}
