"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AcreditacionesDemo } from "@/components/project-demo/acreditaciones-demo";
import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type Project = SiteContent["projectsSection"]["projects"][number];
type Slug = Project["slug"];

const priority: Slug[] = ["acreditaciones-app", "firetrack", "evacuaplan-studio", "hidrantes-app"];

const stories: Record<Locale, Record<Slug, {
  icon: string; category: string; challenge: string; solution: string; label: string;
}>> = {
  es: {
    "acreditaciones-app": {
      icon: "✳", category: "IA + DATOS", label: "Incluye asistente IA",
      challenge: "Reglas y vigencias dispersas.",
      solution: "Consultas inteligentes y planificación verificable.",
    },
    firetrack: {
      icon: "🧯", category: "SAAS", label: "Gestión operativa",
      challenge: "Controles manuales y datos separados.",
      solution: "Inspecciones, inventario y QR conectados.",
    },
    "evacuaplan-studio": {
      icon: "▦", category: "EDITOR", label: "Herramienta visual",
      challenge: "Croquis difíciles de crear.",
      solution: "Un editor para planos de evacuación.",
    },
    "hidrantes-app": {
      icon: "📍", category: "MAPAS", label: "Consulta en campo",
      challenge: "Hidrantes difíciles de consultar.",
      solution: "Mapa por QR con datos de caudal.",
    },
  },
  en: {
    "acreditaciones-app": {
      icon: "✳", category: "AI + DATA", label: "AI assistant included",
      challenge: "Scattered rules and expiry cycles.",
      solution: "Intelligent questions and validated planning.",
    },
    firetrack: {
      icon: "🧯", category: "SAAS", label: "Operational management",
      challenge: "Manual checks and fragmented data.",
      solution: "Inspections, inventory and QR connected.",
    },
    "evacuaplan-studio": {
      icon: "▦", category: "EDITOR", label: "Visual tools",
      challenge: "Plans are hard to create.",
      solution: "A purpose-built evacuation editor.",
    },
    "hidrantes-app": {
      icon: "📍", category: "MAPS", label: "Field lookup",
      challenge: "Hydrant data is hard to reach.",
      solution: "QR-accessible map with flow records.",
    },
  },
};

const ui = {
  es: {
    eyebrow: "JARCEDEV / PERFIL",
    title: "De una idea a una solución.",
    sub: "Analizo procesos, defino el producto y valido el resultado. La IA me ayuda a construirlo.",
    world: "Volver al mundo 3D",
    work: "MIS PROYECTOS",
    choice: "Toca uno para explorarlo",
    before: "PROBLEMA",
    after: "SOLUCIÓN",
    open: "Conocer el proyecto",
    model: "Vista conceptual",
    method: "CÓMO TRABAJO",
    example: "EJEMPLO",
    steps: [
      { icon: "◉", title: "Observo", line: "Entiendo el proceso.", example: "Hidrantes: el acceso debe funcionar desde el teléfono." },
      { icon: "◇", title: "Detecto", line: "Encuentro qué mejorar.", example: "FireTrack: reunir inspecciones e inventarios." },
      { icon: "✧", title: "Defino", line: "Diseño los flujos con IA.", example: "Acreditaciones: reglas de vigencia y planificación." },
      { icon: "✓", title: "Valido", line: "Pruebo y perfecciono.", example: "EvacuaPlan: editar y ubicar objetos fácilmente." },
    ],
    about: "SOBRE MÍ",
    bio: "Ingeniero en Sistemas · Bombero desde 2014 · Diseño de productos y desarrollo asistido por IA.",
    resume: "CV",
    contact: "Hablemos",
  },
  en: {
    eyebrow: "JARCEDEV / PROFILE",
    title: "From an idea to a solution.",
    sub: "I analyze workflows, define products and validate outcomes. AI assists with implementation.",
    world: "Back to 3D world",
    work: "MY PROJECTS",
    choice: "Select one to explore",
    before: "PROBLEM",
    after: "SOLUTION",
    open: "View project",
    model: "Conceptual preview",
    method: "HOW I WORK",
    example: "EXAMPLE",
    steps: [
      { icon: "◉", title: "Observe", line: "Understand the workflow.", example: "Hydrants: direct access from a phone." },
      { icon: "◇", title: "Identify", line: "Spot the opportunity.", example: "FireTrack: connect inspections and inventory." },
      { icon: "✧", title: "Define", line: "Design flows with AI.", example: "Accreditations: expiry rules and planning." },
      { icon: "✓", title: "Validate", line: "Test and improve.", example: "EvacuaPlan: simplify editing and object placement." },
    ],
    about: "ABOUT ME",
    bio: "Systems Engineer · Firefighter since 2014 · Product design and AI-assisted development.",
    resume: "Résumé",
    contact: "Let's talk",
  },
} as const;

export function CompactPortfolio({ lang, content }: { lang: Locale; content: SiteContent }) {
  const t = ui[lang];
  const projects = priority.map((slug) => content.projectsSection.projects.find((p) => p.slug === slug)).filter((p): p is Project => Boolean(p));
  const [selectedSlug, setSelectedSlug] = useState<Slug>("acreditaciones-app");
  const [step, setStep] = useState(0);
  const selected = projects.find((p) => p.slug === selectedSlug) ?? projects[0];
  const info = stories[lang][selected.slug];
  const preview = selected.gallery[0];

  return (
    <>
      <section className="relative overflow-hidden bg-[#0a1425] px-4 pb-8 pt-8 text-white sm:px-8 sm:pb-10 sm:pt-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-[26rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <Link href={"/" + lang + "#mundo"} className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/5 px-4 text-xs font-semibold text-violet-200 hover:bg-white/10">← {t.world}</Link>
          <p className="mt-6 text-[.64rem] font-bold tracking-[.19em] text-violet-300">{t.eyebrow}</p>
          <h1 className="mt-2 max-w-4xl text-balance text-[clamp(2.2rem,6vw,4.4rem)] font-semibold leading-[1.05] tracking-[-.057em]">{t.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{t.sub}</p>
        </div>
      </section>

      <section id={lang === "es" ? "proyectos" : "projects"} className="scroll-mt-24 bg-[#0f1c31] px-4 py-10 text-white sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[.72rem] font-bold tracking-[.18em] text-violet-300">{t.work}</h2>
            <p className="text-xs text-slate-400">{t.choice}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" role="group" aria-label={t.work}>
            {projects.map((project) => {
              const item = stories[lang][project.slug];
              const selectedNow = selectedSlug === project.slug;
              const image = project.gallery[0];
              return (
                <button key={project.slug} type="button" onClick={() => setSelectedSlug(project.slug)} aria-pressed={selectedNow}
                  className={"group overflow-hidden rounded-xl border text-left transition-colors " +
                    (selectedNow ? "border-violet-300 bg-violet-400/15 ring-1 ring-violet-300/35" : "border-white/10 bg-white/[.04] hover:border-violet-300/40")}>
                  <div className="relative h-16 overflow-hidden bg-[#15253e] sm:h-24">
                    {project.slug === "acreditaciones-app" ? (
                      <div aria-hidden="true" className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_center,#483b81,#15253e)] text-4xl text-violet-100">✳ <span className="ml-2 rounded-lg border border-violet-200/30 px-2 py-1 text-[.67rem] font-bold tracking-wide">IA</span></div>
                    ) : image ? (
                      <Image src={image.src} alt="" fill sizes="(max-width:640px) 50vw, 25vw" className="object-contain p-1 opacity-85 transition-opacity group-hover:opacity-100" />
                    ) : null}
                  </div>
                  <div className="flex min-h-16 items-center gap-2 px-2.5 py-2 sm:min-h-14 sm:px-3">
                    <span className="hidden text-lg sm:inline" aria-hidden="true">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[.78rem] font-bold sm:text-sm">{project.title}</p>
                      <p className="mt-0.5 truncate text-[.61rem] text-slate-400">{item.category}</p>
                    </div>
                    {selectedNow && <span aria-hidden="true" className="text-violet-300">●</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[.72fr_1.28fr]">
            <div className="flex flex-col justify-between rounded-[1.25rem] border border-white/10 bg-white/[.045] p-4 sm:p-6">
              <div aria-live="polite">
                <p className="text-[.65rem] font-bold tracking-[.14em] text-violet-300">{info.category}</p>
                <h3 className="mt-1.5 text-2xl font-semibold tracking-tight">{selected.title}</h3>
                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <div>
                    <p className="text-[.64rem] font-bold tracking-[.1em] text-rose-300">{t.before}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">{info.challenge}</p>
                  </div>
                  <div>
                    <p className="text-[.64rem] font-bold tracking-[.1em] text-emerald-300">{t.after}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-200 sm:text-sm">{info.solution}</p>
                  </div>
                </div>
              </div>
              <Link href={"/" + lang + "/projects/" + selected.slug} className="mt-5 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-violet-300 px-5 text-xs font-bold text-slate-950 hover:bg-violet-200">{t.open} ↗</Link>
            </div>

            <div className="min-w-0" key={selected.slug}>
              {selected.slug === "acreditaciones-app" ? (
                <AcreditacionesDemo lang={lang} compact />
              ) : (
                <div className="relative min-h-64 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#081322] sm:min-h-[320px]">
                  {preview && <Image src={preview.src} alt={preview.alt} fill sizes="(max-width:1024px) 100vw, 58vw" className="object-contain p-4 sm:p-6" />}
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#091424]/90 px-3 py-1.5 text-[.62rem] text-slate-300">{t.model}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id={lang === "es" ? "proceso" : "process"} className="scroll-mt-24 bg-[#f4f5f9] px-4 py-9 text-slate-950 sm:px-8 sm:py-12">
        <div id={lang === "es" ? "servicios" : "services"} className="mx-auto max-w-6xl scroll-mt-24">
          <h2 className="text-[.72rem] font-bold tracking-[.18em] text-violet-800">{t.method}</h2>
          <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-3" role="group" aria-label={t.method}>
            {t.steps.map((item, index) => (
              <button key={item.title} type="button" onClick={() => setStep(index)} aria-pressed={step === index}
                className={"min-h-24 rounded-xl border px-1.5 py-3 text-center transition-colors sm:min-h-28 sm:p-4 " +
                  (step === index ? "border-violet-500 bg-violet-100" : "border-slate-200 bg-white hover:border-violet-300")}>
                <span className="block text-xl text-violet-800 sm:text-2xl" aria-hidden="true">{item.icon}</span>
                <span className="mt-2 block text-[.65rem] font-bold sm:text-sm">{item.title}</span>
                <span className="mt-1 hidden text-xs text-slate-600 sm:block">{item.line}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 min-h-10 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-5 text-slate-600" aria-live="polite"><strong className="text-violet-700">{t.example}:</strong> {t.steps[step].example}</p>
        </div>
      </section>

      <section id={lang === "es" ? "sobre-mi" : "about"} className="scroll-mt-24 bg-[#f4f5f9] px-4 pb-9 text-slate-900 sm:px-8 sm:pb-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 border-t border-slate-200 pt-6 sm:gap-5">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
            <Image src="/profile/jorge-arce-square.webp" fill sizes="56px" alt={lang === "es" ? "Jorge Arce" : "Jorge Arce"} className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-bold tracking-[.12em] text-violet-800">{t.about}</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600 sm:text-sm">{t.bio}</p>
          </div>
          <div className="flex gap-2">
            <a href={lang === "es" ? "/cv/Jorge-Arce-Solano-CV-ES.pdf" : "/cv/Jorge-Arce-Solano-CV-EN.pdf"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold hover:border-violet-500">{t.resume} ↗</a>
            <a href="https://www.linkedin.com/in/jorge-arce-solano" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold hover:border-violet-500">LinkedIn ↗</a>
          </div>
        </div>
      </section>
    </>
  );
}
