import type { Locale } from "@/lib/i18n";

/**
 * One source of truth for every project surface:
 * interactive world station, project card, compact project panel, shareable
 * project URL, visual artwork and sitemap. Add another entry here and choose
 * a world structure; no second content or modal implementation is required.
 */
export type StructureType =
  | "academy"
  | "operations"
  | "design-studio"
  | "mapping-hub"
  | "generic";

export type ProjectDefinition = {
  slug: string;
  station: {
    id: string;
    x: number;
    z: number;
    structure: StructureType;
  };
  icon: string;
  accent: string;
  preview: string;
  technologies: readonly string[];
  demo?: "acreditaciones-ai";
  locale: Record<Locale, {
    title: string;
    category: string;
    problem: string;
    solution: string;
    status: string;
    previewAlt: string;
  }>;
};

export const projectDefinitions = [
  {
    slug: "acreditaciones-app",
    station: { id: "acreditaciones", x: -14, z: 12, structure: "academy" },
    icon: "✳",
    accent: "#a78bfa",
    preview: "/projects/previews/acreditaciones.svg",
    technologies: ["Next.js", "Python", "DuckDB", "OR-Tools", "IA"],
    demo: "acreditaciones-ai",
    locale: {
      es: {
        title: "Acreditaciones",
        category: "IA · Reglas · Planificación",
        problem: "Históricos, bloques y vigencias complejas.",
        solution: "Un sistema que consulta, valida y planifica con IA.",
        status: "Sistema privado",
        previewAlt: "Ilustración del asistente de IA y análisis de Acreditaciones, con datos ficticios",
      },
      en: {
        title: "Accreditations",
        category: "AI · Rules · Planning",
        problem: "Complex records, blocks and expiry cycles.",
        solution: "A system for AI-assisted queries, verification and planning.",
        status: "Private system",
        previewAlt: "Illustration of Accreditations AI assistant and analytics with fictional records",
      },
    },
  },
  {
    slug: "firetrack",
    station: { id: "firetrack", x: -14, z: -12, structure: "operations" },
    icon: "🧯",
    accent: "#fb7185",
    preview: "/projects/previews/firetrack.svg",
    technologies: ["Next.js", "TypeScript", "Supabase", "QR"],
    locale: {
      es: {
        title: "FireTrack",
        category: "SaaS · Trazabilidad",
        problem: "Inspecciones e inventario en registros dispersos.",
        solution: "Control de extintores, QR y mantenimiento reunidos.",
        status: "SaaS operativo",
        previewAlt: "Ilustración conceptual del dashboard FireTrack, con indicadores e inventario",
      },
      en: {
        title: "FireTrack",
        category: "SaaS · Traceability",
        problem: "Inspection and inventory records spread across systems.",
        solution: "Extinguisher control, QR and maintenance in one product.",
        status: "Operational SaaS",
        previewAlt: "Illustration of FireTrack's dashboard, indicators and inventory",
      },
    },
  },
  {
    slug: "evacuaplan-studio",
    station: { id: "evacuaplan", x: 14, z: -12, structure: "design-studio" },
    icon: "▦",
    accent: "#67e8f9",
    preview: "/projects/previews/evacuaplan.svg",
    technologies: ["Next.js", "React", "TypeScript", "Konva"],
    locale: {
      es: {
        title: "EvacuaPlan Studio",
        category: "Editor · Planos",
        problem: "Diseñar y actualizar croquis resultaba poco práctico.",
        solution: "Editor visual de planos de evacuación.",
        status: "Editor en evolución",
        previewAlt: "Ilustración de un editor de planos de evacuación con símbolos y herramientas",
      },
      en: {
        title: "EvacuaPlan Studio",
        category: "Editor · Plans",
        problem: "Drawing and revising evacuation plans was cumbersome.",
        solution: "A specialized interactive evacuation plan editor.",
        status: "Editor in development",
        previewAlt: "Illustration of an evacuation plan editor with symbols and drawing tools",
      },
    },
  },
  {
    slug: "hidrantes-app",
    station: { id: "hidrantes", x: 14, z: 12, structure: "mapping-hub" },
    icon: "📍",
    accent: "#6ee7b7",
    preview: "/projects/previews/hidrantes.svg",
    technologies: ["Next.js", "Leaflet", "Supabase", "QR"],
    locale: {
      es: {
        title: "Hidrantes",
        category: "Mapa · Operación",
        problem: "Consultar ubicación y caudal en campo era lento.",
        solution: "Mapa móvil por QR con GPM y edición protegida.",
        status: "App desarrollada · despliegue por verificar",
        previewAlt: "Ilustración de mapa de hidrantes con puntos ficticios",
      },
      en: {
        title: "Hydrants",
        category: "Map · Operations",
        problem: "Field lookup for hydrant location and flow was slow.",
        solution: "QR-first mobile map with flow and protected editing.",
        status: "App developed · deployment unverified",
        previewAlt: "Illustration of a hydrant map with fictional points",
      },
    },
  },
] as const satisfies readonly ProjectDefinition[];

export type ProjectId = (typeof projectDefinitions)[number]["slug"];
export type StationId = (typeof projectDefinitions)[number]["station"]["id"];

export type ProjectView = {
  slug: ProjectId;
  station: ProjectDefinition["station"];
  icon: string;
  accent: string;
  preview: string;
  technologies: readonly string[];
  demo?: "acreditaciones-ai";
  title: string;
  category: string;
  problem: string;
  solution: string;
  status: string;
  previewAlt: string;
  description: string;
  highlights: string[];
  gallery: { id: string; label: string; title: string; description: string; src: string; alt: string }[];
  caseStudyLabel: string;
  externalUrl?: string;
  externalLabel?: string;
};

export function getProjects(lang: Locale): ProjectView[] {
  return projectDefinitions.map((project) => ({
    slug: project.slug,
    station: project.station,
    icon: project.icon,
    accent: project.accent,
    preview: project.preview,
    technologies: project.technologies,
    demo: "demo" in project && project.demo === "acreditaciones-ai" ? "acreditaciones-ai" : undefined,
    ...project.locale[lang],
    description: project.locale[lang].solution,
    highlights: [project.locale[lang].problem, project.locale[lang].solution],
    gallery: [{
      id: "overview",
      label: lang === "es" ? "Vista ilustrativa" : "Illustration",
      title: project.locale[lang].title,
      description: project.locale[lang].solution,
      src: project.preview,
      alt: project.locale[lang].previewAlt,
    }],
    caseStudyLabel: lang === "es" ? "Ver proyecto" : "View project",
    externalUrl: project.slug === "firetrack" ? "https://firetrackcr.com" : undefined,
    externalLabel: project.slug === "firetrack"
      ? (lang === "es" ? "Abrir FireTrack" : "Open FireTrack")
      : undefined,
  }));
}

export function getProject(lang: Locale, slug: string): ProjectView | undefined {
  return getProjects(lang).find((project) => project.slug === slug);
}

export function getWorldStations() {
  return projectDefinitions.map((project) => ({
    id: project.station.id,
    slug: project.slug,
    x: project.station.x,
    z: project.station.z,
    color: project.accent,
    structure: project.station.structure,
  }));
}
