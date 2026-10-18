"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type Project = SiteContent["projectsSection"]["projects"][number];
type Slug = Project["slug"];

const insights: Record<Locale, Record<Slug, { icon: string; area: string; issue: string; result: string }>> = {
  es: {
    firetrack: { icon: "🧯", area: "Trazabilidad", issue: "Inspecciones e inventarios dispersos", result: "Controles, QR y mantenimiento en un mismo sistema." },
    "evacuaplan-studio": { icon: "🏢", area: "Herramientas especializadas", issue: "Croquis difíciles de crear y actualizar", result: "Editor de planos diseñado para el proceso." },
    "acreditaciones-app": { icon: "🎓", area: "Reglas y datos", issue: "Históricos y vigencias difíciles de conciliar", result: "Ciclos, trazabilidad y planificación con datos." },
    "hidrantes-app": { icon: "📍", area: "Información geográfica", issue: "Datos de hidrantes poco accesibles en campo", result: "Mapa por QR, consulta de GPM y edición protegida." },
  },
  en: {
    firetrack: { icon: "🧯", area: "Traceability", issue: "Scattered inspection and inventory records", result: "QR access, controls and maintenance in one system." },
    "evacuaplan-studio": { icon: "🏢", area: "Specialized tools", issue: "Plans are hard to create and update", result: "Purpose-built evacuation plan editor." },
    "acreditaciones-app": { icon: "🎓", area: "Rules and analytics", issue: "Complex historical records and validity cycles", result: "Cycle management, auditability and data-driven planning." },
    "hidrantes-app": { icon: "📍", area: "Operational maps", issue: "Hydrant records are hard to consult in the field", result: "QR map, flow readings and protected edits." },
  },
};

const copy = {
  es: {
    eyebrow: "PORTAFOLIO / JARCEDEV",
    first: "Detecto oportunidades.",
    second: "Diseño soluciones.",
    lead: "Comprendo procesos reales, defino productos y valido resultados. La IA me asiste con la arquitectura y la programación.",
    back: "Regresar al mundo 3D",
    work: "PROYECTOS",
    workTitle: "Cuatro problemas. Cuatro soluciones.",
    workHint: "Selecciona uno para conocerlo.",
    before: "EL PROBLEMA",
    after: "LA SOLUCIÓN",
    view: "Explorar caso",
    preview: "Vista ilustrativa",
    method: "MI MÉTODO",
    methodTitle: "De una oportunidad a una solución funcional.",
    methodLead: "No empiezo escribiendo código. Empiezo comprendiendo cómo funciona un proceso.",
    step: "ETAPA",
    example: "EJEMPLO REAL",
    stages: [
      { label: "Observar", detail: "Conozco el proceso, las personas, las reglas y las necesidades.", example: "Hidrantes: consultar recursos desde el teléfono, sin iniciar sesión." },
      { label: "Detectar", detail: "Identifico información dispersa, tareas repetidas y oportunidades de mejora.", example: "FireTrack: unificar inventario, inspecciones y seguimiento." },
      { label: "Definir", detail: "Establezco flujos y requisitos. La IA propone herramientas y genera el código.", example: "Acreditaciones: definir bloques, ciclos y vencimientos según modalidad." },
      { label: "Validar", detail: "Pruebo escenarios reales, reporto problemas y dirijo las mejoras.", example: "EvacuaPlan: probar selección, ubicación y edición de elementos." },
    ],
    strengths: "LO QUE APORTO",
    abilities: ["Análisis de procesos", "Diseño funcional", "Validación e iteración"],
    ai: "Mi responsabilidad está en detectar el problema, definir las reglas y verificar resultados. El código se genera con asistencia de IA.",
    about: "SOBRE MÍ",
    aboutTitle: "Conecto operaciones con tecnología.",
    bio: "Soy Ingeniero en Sistemas. Desde 2014 trabajo en atención de emergencias, experiencia que me ayuda a entender operaciones y detectar oportunidades de mejora.",
    bio2: "Guío el diseño funcional de productos y su implementación asistida por IA.",
    location: "Costa Rica",
    history: "Bombero desde 2014",
    lang: "Inglés C1",
    resume: "Ver CV",
    contact: "Conversemos",
  },
  en: {
    eyebrow: "PORTFOLIO / JARCEDEV",
    first: "I spot opportunities.",
    second: "I shape solutions.",
    lead: "I learn real workflows, define products and validate results. AI assists me with architecture and coding.",
    back: "Back to the 3D world",
    work: "PROJECTS",
    workTitle: "Four problems. Four solutions.",
    workHint: "Select one to explore it.",
    before: "THE PROBLEM",
    after: "THE SOLUTION",
    view: "Explore case study",
    preview: "Illustrative preview",
    method: "MY APPROACH",
    methodTitle: "From operational opportunity to a working product.",
    methodLead: "I don't start by writing code. I start by understanding how people work.",
    step: "STEP",
    example: "REAL EXAMPLE",
    stages: [
      { label: "Observe", detail: "I learn the workflows, people, rules and actual needs.", example: "Hydrants: public lookup from a phone without logging in." },
      { label: "Identify", detail: "I spot scattered information, repeated tasks and improvement opportunities.", example: "FireTrack: combine inventory, inspections and tracking." },
      { label: "Define", detail: "I specify workflows and requirements. AI explores tools and generates code.", example: "Accreditations: define modality-specific blocks and expiry cycles." },
      { label: "Validate", detail: "I test actual use cases, report issues and guide iterations.", example: "EvacuaPlan: validate selecting, placing and editing elements." },
    ],
    strengths: "WHAT I BRING",
    abilities: ["Process analysis", "Functional product design", "Testing and iteration"],
    ai: "My responsibility is to discover the problem, define the rules and validate results. Software coding is assisted by AI.",
    about: "ABOUT ME",
    aboutTitle: "Bridging operations and technology.",
    bio: "I'm a Systems Engineer. My experience in emergency response since 2014 has taught me to understand operations and spot improvement opportunities.",
    bio2: "I guide functional product design and AI-assisted software implementation.",
    location: "Costa Rica",
    history: "Firefighter since 2014",
    lang: "English C1",
    resume: "View résumé",
    contact: "Let's talk",
  },
} as const;

export function CompactPortfolio({ lang, content }: { lang: Locale; content: SiteContent }) {
  const t = copy[lang];
  const projects = content.projectsSection.projects;
  const [selectedSlug, setSelectedSlug] = useState<Slug>(projects[0].slug);
  const [step, setStep] = useState(0);
  const selected = projects.find((project) => project.slug === selectedSlug) ?? projects[0];
  const details = insights[lang][selected.slug];
  const image = selected.gallery[0];

  return (
    <>
      <section className="relative overflow-hidden bg-[#0a1426] px-4 pb-14 pt-12 text-white sm:px-8 sm:pb-20 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-24 size-[30rem] rounded-full bg-violet-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <Link href={"/" + lang + "#mundo"} className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/5 px-4 text-xs font-semibold text-violet-200 hover:bg-white/10">← {t.back}</Link>
          <p className="mt-9 text-[.7rem] font-bold tracking-[.19em] text-violet-300">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-5xl text-balance text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[1.02] tracking-[-.06em]">
            {t.first}<span className="block text-violet-300">{t.second}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{t.lead}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={lang === "es" ? "#proyectos" : "#projects"} className="inline-flex min-h-11 items-center rounded-full bg-violet-300 px-5 text-sm font-bold text-slate-950 hover:bg-violet-200">{t.work} ↓</a>
            <a href={lang === "es" ? "#contacto" : "#contact"} className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold hover:bg-white/10">{t.contact} ↗</a>
          </div>
        </div>
      </section>

      <section id={lang === "es" ? "proyectos" : "projects"} className="scroll-mt-24 bg-[#f6f7fb] px-4 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[.69rem] font-bold tracking-[.19em] text-violet-700">{t.work}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h2 className="max-w-2xl text-balance text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-.05em] text-slate-950">{t.workTitle}</h2>
            <span className="text-xs text-slate-500">{t.workHint}</span>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" role="group" aria-label={t.work}>
            {projects.map((project, index) => {
              const item = insights[lang][project.slug];
              const active = selected.slug === project.slug;
              return (
                <button
                  type="button"
                  key={project.slug}
                  onClick={() => setSelectedSlug(project.slug)}
                  aria-pressed={active}
                  className={"min-h-32 rounded-2xl border p-3 text-left transition-all duration-200 sm:min-h-36 sm:p-4 " + (active ? "border-violet-300 bg-[#111d34] text-white shadow-xl" : "border-slate-200 bg-white text-slate-950 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md")}
                >
                  <div className="flex items-center justify-between"><span className="text-2xl" aria-hidden="true">{item.icon}</span><span className="font-mono text-[.68rem] text-violet-400">0{index + 1}</span></div>
                  <span className="mt-3 block truncate text-sm font-bold sm:text-base">{project.title}</span>
                  <span className={"mt-1 block text-[.69rem] leading-4 " + (active ? "text-slate-300" : "text-slate-500")}>{item.area}</span>
                </button>
              );
            })}
          </div>
          <article key={selected.slug} className="mt-3 grid min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/40 lg:grid-cols-2">
            <div className="flex flex-col justify-between p-5 sm:p-8">
              <div aria-live="polite">
                <p className="text-[.7rem] font-bold uppercase tracking-[.14em] text-violet-700">{details.area}</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{selected.title}</h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="border-l-2 border-rose-300 pl-3"><p className="text-[.66rem] font-bold tracking-[.12em] text-rose-700">{t.before}</p><p className="mt-1 text-sm leading-6 text-slate-700">{details.issue}</p></div>
                  <div className="border-l-2 border-emerald-400 pl-3"><p className="text-[.66rem] font-bold tracking-[.12em] text-emerald-700">{t.after}</p><p className="mt-1 text-sm leading-6 text-slate-700">{details.result}</p></div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex flex-wrap gap-1.5">
                  {selected.technologies.slice(0, 4).map((technology) => <span key={technology} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[.68rem] text-slate-600">{technology}</span>)}
                </div>
                <Link href={"/" + lang + "/projects/" + selected.slug} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-violet-900">{t.view} ↗</Link>
              </div>
            </div>
            <div className="relative min-h-60 overflow-hidden bg-[#121d32] sm:min-h-80">
              {image && <Image src={image.src} alt={image.alt} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-contain p-3 sm:p-6" />}
              <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-[#111d33]/85 px-3 py-1.5 text-[.68rem] font-semibold text-white backdrop-blur">{t.preview}</span>
            </div>
          </article>
        </div>
      </section>

      <section id={lang === "es" ? "proceso" : "process"} className="scroll-mt-24 bg-[#101d32] px-4 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-[.69rem] font-bold tracking-[.19em] text-violet-300">{t.method}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-.05em]">{t.methodTitle}</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">{t.methodLead}</p>
            <div id={lang === "es" ? "servicios" : "services"} className="mt-7 scroll-mt-24">
              <p className="mb-2 text-[.67rem] font-bold tracking-[.15em] text-slate-400">{t.strengths}</p>
              <div className="flex flex-wrap gap-2">
                {t.abilities.map((ability) => <span key={ability} className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs text-slate-200">{ability}</span>)}
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/15 bg-white/[.045] p-4 sm:p-6">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2" role="group" aria-label={t.method}>
              {t.stages.map((stage, index) => (
                <button type="button" key={stage.label} aria-pressed={step === index} onClick={() => setStep(index)}
                  className={"min-h-20 rounded-xl border p-1.5 text-center transition-colors sm:p-3 " + (step === index ? "border-violet-300 bg-violet-300/20 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:border-violet-300/50")}>
                  <span className="block font-mono text-xs text-violet-300">0{index + 1}</span>
                  <span className="mt-1 block text-[.68rem] font-semibold sm:text-sm">{stage.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div className="h-full rounded-full bg-violet-300 transition-[width] duration-300" style={{ width: (step + 1) * 25 + "%" }} />
            </div>
            <div className="mt-7 min-h-52" aria-live="polite">
              <p className="text-[.65rem] font-bold tracking-[.18em] text-violet-300">{t.step} 0{step + 1} / 04</p>
              <h3 className="mt-2 text-2xl font-semibold">{t.stages[step].label}</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-200">{t.stages[step].detail}</p>
              <div className="mt-5 rounded-xl border border-white/10 bg-[#081424]/60 p-3.5">
                <p className="text-[.68rem] font-bold tracking-[.13em] text-emerald-300">{t.example}</p>
                <p className="mt-1 text-sm leading-6 text-slate-200">{t.stages[step].example}</p>
              </div>
            </div>
          </div>
          <p className="border-t border-white/10 pt-5 text-xs leading-6 text-slate-400 lg:col-span-2">{t.ai}</p>
        </div>
      </section>

      <section id={lang === "es" ? "sobre-mi" : "about"} className="scroll-mt-24 bg-[#f6f7fb] px-4 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-5 sm:grid-cols-[108px_1fr] lg:grid-cols-[130px_1fr_auto]">
          <div className="relative size-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:size-28 lg:size-32">
            <Image src="/profile/jorge-arce-square.webp" alt={lang === "es" ? "Retrato de Jorge Arce" : "Jorge Arce portrait"} fill sizes="128px" className="object-cover" />
          </div>
          <div>
            <p className="text-[.68rem] font-bold tracking-[.19em] text-violet-700">{t.about}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{t.aboutTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{t.bio}</p>
            <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-500">{t.bio2}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[.69rem] font-semibold text-slate-600">
              {[t.location, t.history, t.lang].map((label) => <span key={label} className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{label}</span>)}
            </div>
          </div>
          <div className="flex gap-2 sm:col-start-2 lg:col-start-auto lg:flex-col">
            <a href={lang === "es" ? "/cv/Jorge-Arce-Solano-CV-ES.pdf" : "/cv/Jorge-Arce-Solano-CV-EN.pdf"} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-900 hover:border-violet-400">{t.resume} ↗</a>
            <a href="https://www.linkedin.com/in/jorge-arce-solano" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-900 hover:border-violet-400">LinkedIn ↗</a>
          </div>
        </div>
      </section>
    </>
  );
}
