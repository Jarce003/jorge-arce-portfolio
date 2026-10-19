"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ProjectPanel } from "@/components/projects/project-panel";
import { ProjectArtwork } from "@/components/projects/project-artwork";
import { getProjects, type ProjectId } from "@/content/projects";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    eyebrow: "JARCEDEV · SOLUCIONES",
    headline: "De problemas a productos.",
    lead: "Analizo procesos, defino soluciones y valido resultados con desarrollo asistido por IA.",
    returnWorld: "Explorar mundo 3D",
    projects: "MIS PROYECTOS",
    select: "Selecciona un proyecto",
    process: "MI PROCESO",
    method: [
      { name: "Observar", detail: "Comprender cómo funciona la operación." },
      { name: "Detectar", detail: "Encontrar lo que se puede mejorar." },
      { name: "Definir", detail: "Diseñar la solución y desarrollarla con IA." },
      { name: "Validar", detail: "Probarla, corregirla y seguir mejorando." },
    ],
    profile: "Ingeniero en Sistemas · Experiencia operativa desde 2014 · Desarrollo asistido por IA.",
    note: "El código se implementa con asistencia de IA; mi aporte está en el problema, las decisiones y la validación.",
    contact: "Conversemos",
  },
  en: {
    eyebrow: "JARCEDEV · SOLUTIONS",
    headline: "From problems to products.",
    lead: "I analyze workflows, shape solutions and validate results with AI-assisted development.",
    returnWorld: "Explore the 3D world",
    projects: "SELECTED PROJECTS",
    select: "Select a project",
    process: "MY APPROACH",
    method: [
      { name: "Observe", detail: "Understand how the operation works." },
      { name: "Identify", detail: "Spot what could work better." },
      { name: "Define", detail: "Design the solution and build it with AI." },
      { name: "Validate", detail: "Test, adjust and keep improving." },
    ],
    profile: "Systems Engineer · Operational experience since 2014 · AI-assisted development.",
    note: "AI tools implement the source code; I lead the problems, product decisions and validation.",
    contact: "Let's talk",
  },
} as const;

export function CompactPortfolio({ lang }: { lang: Locale }) {
  const t = copy[lang];
  const projects = getProjects(lang);
  const [selectedSlug, setSelectedSlug] = useState<ProjectId>("acreditaciones-app");
  const [step, setStep] = useState(0);
  const selected = projects.find((project) => project.slug === selectedSlug) ?? projects[0];

  return (
    <>
      <section className="bg-[#0a1425] px-4 pb-5 pt-7 text-white sm:px-8 sm:pb-8 sm:pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href={"/" + lang + "#mundo"} className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-violet-200 hover:bg-white/10">← {t.returnWorld}</Link>
            <span className="text-[.66rem] font-semibold tracking-[.16em] text-violet-300">{t.eyebrow}</span>
          </div>
          <h1 className="mt-6 text-balance text-[clamp(2rem,5.5vw,3.8rem)] font-semibold leading-[1.08] tracking-[-.055em]">{t.headline}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{t.lead}</p>
        </div>
      </section>

      <section id={lang === "es" ? "proyectos" : "projects"} className="scroll-mt-24 bg-[#101c31] px-4 pb-10 pt-6 text-white sm:px-8 sm:pb-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[.66rem] font-bold tracking-[.18em] text-violet-300">{t.projects}</h2>
            <p className="text-xs text-slate-400">{t.select}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" role="group" aria-label={t.projects}>
            {projects.map((project) => {
              const active = selected.slug === project.slug;
              return (
                <button key={project.slug} type="button" aria-pressed={active}
                  onClick={() => setSelectedSlug(project.slug)}
                  className={"group overflow-hidden rounded-xl border text-left transition-all duration-200 " +
                    (active ? "border-violet-300 bg-violet-300/15 shadow-lg shadow-violet-950/20" : "border-white/10 bg-white/[.04] hover:border-violet-300/50")}>
                  <div className="relative h-24 overflow-hidden bg-[#071323] sm:h-28">
                    <ProjectArtwork key={project.slug} project={project} decorative sizes="(max-width: 640px) 50vw, 25vw" className="transition-transform duration-200 group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex min-h-14 items-center gap-2 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[.77rem] font-bold sm:text-sm">{project.title}</p>
                      <p className="mt-0.5 truncate text-[.64rem] text-slate-400">{project.category}</p>
                    </div>
                    {active && <span aria-hidden="true" className="text-violet-300">●</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3" aria-live="polite">
            <ProjectPanel key={selected.slug} project={selected} lang={lang} compact showAiByDefault={selected.demo === "acreditaciones-ai"} directLink={false} />
          </div>
        </div>
      </section>

      <section id={lang === "es" ? "proceso" : "process"} className="scroll-mt-24 bg-[#f4f6fa] px-4 py-9 text-slate-950 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[.7rem] font-bold tracking-[.18em] text-violet-700">{t.process}</h2>
          <div id={lang === "es" ? "servicios" : "services"} className="mt-3 grid scroll-mt-24 grid-cols-4 gap-1.5 sm:gap-3" role="group" aria-label={t.process}>
            {t.method.map((item, index) => (
              <button key={item.name} type="button" onClick={() => setStep(index)} aria-pressed={step === index}
                className={"min-h-19 rounded-xl border px-1 py-3 text-center text-[.7rem] font-semibold transition-colors sm:min-h-20 sm:text-sm " +
                  (step === index ? "border-violet-400 bg-violet-100 text-violet-950" : "border-slate-200 bg-white text-slate-700 hover:border-violet-300")}>
                <span className="mb-1 block text-[.66rem] text-violet-700">0{index + 1}</span>{item.name}
              </button>
            ))}
          </div>
          <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600" aria-live="polite">
            {t.method[step].detail}
          </p>
        </div>
      </section>

      <section id={lang === "es" ? "sobre-mi" : "about"} className="scroll-mt-24 bg-[#f4f6fa] px-4 pb-9 text-slate-800 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl">
            <Image src="/profile/jorge-arce-square.webp" alt={lang === "es" ? "Jorge Arce" : "Jorge Arce portrait"} fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-[170px] flex-1">
            <p className="text-xs font-semibold">{t.profile}</p>
            <p className="mt-1 text-[.71rem] leading-5 text-slate-500">{t.note}</p>
          </div>
          <div className="flex gap-2">
            <a href="https://www.linkedin.com/in/jorge-arce-solano"
              target="_blank" rel="noopener noreferrer"
              aria-label={lang === "es" ? "Ver perfil de LinkedIn" : "View LinkedIn profile"}
              title="LinkedIn"
              className="inline-flex size-11 items-center justify-center rounded-full border border-slate-300 bg-white text-[#0A66C2] transition-colors hover:border-[#0A66C2] hover:bg-[#e9f3ff]">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
                <path d="M20.447 20.452h-3.554v-5.57c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.94v5.667H9.352V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.73v20.54c0 .956.792 1.73 1.771 1.73h20.451c.978 0 1.778-.774 1.778-1.73V1.73C24 .774 23.2 0 22.222 0h.003Z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
