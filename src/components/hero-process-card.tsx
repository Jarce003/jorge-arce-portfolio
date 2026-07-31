"use client";

import { useState } from "react";

type HeroProcessCardProps = {
  lang: "es" | "en";
};

type TabId = "process" | "architecture" | "delivery";

type CardStep = {
  number: string;
  title: string;
  description: string;
};

type CardTab = {
  id: TabId;
  label: string;
  eyebrow: string;
  steps: CardStep[];
  capabilities: string[];
  title: string;
  description: string;
};

const cardContent: Record<
  "es" | "en",
  {
    tabs: CardTab[];
  }
> = {
  es: {
    tabs: [
      {
        id: "process",
        label: "Proceso",
        eyebrow: "Producto completo",
        steps: [
          {
            number: "01",
            title: "Análisis",
            description: "Necesidad y flujo operativo",
          },
          {
            number: "02",
            title: "Diseño",
            description: "Interfaz y arquitectura",
          },
          {
            number: "03",
            title: "Desarrollo",
            description: "Aplicación funcional",
          },
          {
            number: "04",
            title: "Producción",
            description: "Pruebas y despliegue",
          },
        ],
        capabilities: [
          "Necesidad real",
          "Flujo definido",
          "Resultado funcional",
        ],
        title: "Desarrollo de extremo a extremo",
        description:
          "Del análisis de la operación al diseño, implementación, validación y despliegue.",
      },
      {
        id: "architecture",
        label: "Arquitectura",
        eyebrow: "Base técnica",
        steps: [
          {
            number: "01",
            title: "Interfaz",
            description: "Experiencia clara y responsive",
          },
          {
            number: "02",
            title: "Aplicación",
            description: "Lógica y procesos de negocio",
          },
          {
            number: "03",
            title: "Datos",
            description: "Modelo consistente y trazable",
          },
          {
            number: "04",
            title: "Seguridad",
            description: "Roles, permisos y aislamiento",
          },
        ],
        capabilities: [
          "Diseño responsive",
          "Roles y permisos",
          "Datos protegidos",
        ],
        title: "Arquitectura para operaciones reales",
        description:
          "Cada capa se diseña para mantener claridad, seguridad, rendimiento y capacidad de crecimiento.",
      },
      {
        id: "delivery",
        label: "Entrega",
        eyebrow: "Listo para operar",
        steps: [
          {
            number: "01",
            title: "Validación",
            description: "Revisión del flujo completo",
          },
          {
            number: "02",
            title: "Calidad",
            description: "Pruebas y corrección de fallos",
          },
          {
            number: "03",
            title: "Despliegue",
            description: "Publicación en producción",
          },
          {
            number: "04",
            title: "Evolución",
            description: "Mejoras y nuevas funciones",
          },
        ],
        capabilities: [
          "Pruebas",
          "Producción",
          "Mejora continua",
        ],
        title: "Entrega funcional y preparada para crecer",
        description:
          "La solución se valida, despliega y queda preparada para evolucionar según nuevas necesidades.",
      },
    ],
  },
  en: {
    tabs: [
      {
        id: "process",
        label: "Process",
        eyebrow: "Complete product",
        steps: [
          {
            number: "01",
            title: "Discovery",
            description: "Needs and operational flow",
          },
          {
            number: "02",
            title: "Design",
            description: "Interface and architecture",
          },
          {
            number: "03",
            title: "Development",
            description: "Working application",
          },
          {
            number: "04",
            title: "Production",
            description: "Testing and deployment",
          },
        ],
        capabilities: [
          "Real need",
          "Defined workflow",
          "Working result",
        ],
        title: "Full-cycle product development",
        description:
          "From operational analysis to design, implementation, validation and deployment.",
      },
      {
        id: "architecture",
        label: "Architecture",
        eyebrow: "Technical foundation",
        steps: [
          {
            number: "01",
            title: "Interface",
            description: "Clear responsive experience",
          },
          {
            number: "02",
            title: "Application",
            description: "Business logic and workflows",
          },
          {
            number: "03",
            title: "Data",
            description: "Consistent traceable model",
          },
          {
            number: "04",
            title: "Security",
            description: "Roles, permissions and isolation",
          },
        ],
        capabilities: [
          "Responsive design",
          "Roles and permissions",
          "Protected data",
        ],
        title: "Architecture for real operations",
        description:
          "Every layer is designed for clarity, security, performance and sustainable growth.",
      },
      {
        id: "delivery",
        label: "Delivery",
        eyebrow: "Ready to operate",
        steps: [
          {
            number: "01",
            title: "Validation",
            description: "Complete workflow review",
          },
          {
            number: "02",
            title: "Quality",
            description: "Testing and defect resolution",
          },
          {
            number: "03",
            title: "Deployment",
            description: "Production release",
          },
          {
            number: "04",
            title: "Evolution",
            description: "Improvements and new features",
          },
        ],
        capabilities: [
          "Testing",
          "Production",
          "Continuous improvement",
        ],
        title: "Functional delivery prepared to grow",
        description:
          "The solution is validated, deployed and prepared to evolve as new needs emerge.",
      },
    ],
  },
};

export function HeroProcessCard({
  lang,
}: HeroProcessCardProps) {
  const [activeTabId, setActiveTabId] =
    useState<TabId>("process");

  const content = cardContent[lang];

  const activeTab =
    content.tabs.find(
      (tab) => tab.id === activeTabId,
    ) ?? content.tabs[0];

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950/20 sm:rounded-[1.7rem]">
      <div
        className="flex gap-1 overflow-x-auto border-b border-slate-800 p-2.5 sm:p-3"
        role="tablist"
        aria-label={
          lang === "es"
            ? "Etapas del desarrollo"
            : "Development stages"
        }
      >
        {content.tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`hero-tab-panel-${tab.id}`}
              id={`hero-tab-${tab.id}`}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-xl px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-sm ${
                isActive
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        key={activeTab.id}
        id={`hero-tab-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`hero-tab-${activeTab.id}`}
        className="relative aspect-[1.34/1] overflow-hidden bg-slate-950 p-4 sm:aspect-[1.62/1] sm:p-5"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(148, 163, 184, 0.16) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-400/10 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-400 sm:text-xs">
              {activeTab.eyebrow}
            </p>
          </div>

          <div className="relative mt-4 grid flex-1 grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-4 sm:items-center sm:gap-3">
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 hidden h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent sm:block"
              aria-hidden="true"
            />

            {activeTab.steps.map((step) => (
              <article
                key={step.number}
                className="relative z-10 flex min-h-[6.25rem] flex-col rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-lg shadow-slate-950/20 sm:min-h-[7rem] sm:p-3.5"
              >
                <span className="font-mono text-[0.65rem] font-bold text-cyan-400">
                  {step.number}
                </span>

                <h3 className="mt-auto text-sm font-bold text-white sm:text-base">
                  {step.title}
                </h3>

                <p className="mt-1 text-[0.68rem] leading-4 text-slate-400 sm:text-xs">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
            {activeTab.capabilities.map(
              (capability) => (
                <span
                  key={capability}
                  className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[0.6rem] font-semibold text-slate-300 sm:text-[0.68rem]"
                >
                  {capability}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div
        key={`${activeTab.id}-description`}
        className="border-t border-slate-800 px-4 py-4 sm:px-5"
      >
        <p className="text-sm font-bold text-white">
          {activeTab.title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {activeTab.description}
        </p>
      </div>
    </div>
  );
}