"use client";

import Link from "next/link";
import { useState } from "react";

import { AcreditacionesDemo } from "@/components/project-demo/acreditaciones-demo";
import { ProjectArtwork } from "@/components/projects/project-artwork";
import type { ProjectView } from "@/content/projects";
import type { Locale } from "@/lib/i18n";

type Props = {
  project: ProjectView;
  lang: Locale;
  onClose?: () => void;
  compact?: boolean;
  showAiByDefault?: boolean;
  directLink?: boolean;
};

export function ProjectPanel({
  project,
  lang,
  onClose,
  compact = false,
  showAiByDefault = false,
  directLink = true,
}: Props) {
  const [aiOpen, setAiOpen] = useState(showAiByDefault);
  const t = lang === "es"
    ? {
      problem: "EL PROBLEMA",
      solution: "LA SOLUCIÓN",
      ai: "Probar asistente IA",
      hideAi: "Cerrar demostración",
      contact: "Conversemos",
      open: "Enlace directo",
      close: "Cerrar",
      synthetic: "Vista ilustrativa · sin datos privados",
    }
    : {
      problem: "THE PROBLEM",
      solution: "THE SOLUTION",
      ai: "Try AI assistant",
      hideAi: "Close preview",
      contact: "Let's talk",
      open: "Shareable link",
      close: "Close",
      synthetic: "Illustrative preview · no private data",
    };

  return (
    <article className={"min-w-0 overflow-hidden rounded-[1.3rem] border border-white/15 bg-[#101b30] text-white shadow-xl " + (compact ? "" : "shadow-black/20")}>
      <div className={"grid min-w-0 gap-0 " + (compact ? "lg:grid-cols-[.84fr_1.16fr]" : "lg:grid-cols-2")}>
        <div className="flex min-w-0 flex-col justify-between p-4 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[.65rem] font-semibold" style={{ color: project.accent }}>
                {project.category}
              </span>
              {onClose && (
                <button type="button" onClick={onClose} aria-label={t.close} className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-lg hover:bg-white/10">×</button>
              )}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="border-l-2 border-rose-300 pl-3">
                <p className="text-[.62rem] font-bold tracking-[.12em] text-rose-300">{t.problem}</p>
                <p className="mt-1 text-[.79rem] leading-5 text-slate-200">{project.problem}</p>
              </div>
              <div className="border-l-2 border-emerald-300 pl-3">
                <p className="text-[.62rem] font-bold tracking-[.12em] text-emerald-300">{t.solution}</p>
                <p className="mt-1 text-[.79rem] leading-5 text-slate-200">{project.solution}</p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((technology) => (
                <span key={technology} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[.66rem] font-medium text-slate-300">{technology}</span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {project.demo === "acreditaciones-ai" && (
                <button type="button" onClick={() => setAiOpen((open) => !open)}
                  aria-expanded={aiOpen}
                  className="inline-flex min-h-10 items-center rounded-full bg-violet-300 px-4 text-xs font-bold text-slate-950 hover:bg-violet-200">
                  ✳ {aiOpen ? t.hideAi : t.ai}
                </button>
              )}
              <Link href={"/" + lang + "/portfolio#contacto".replace("contacto",lang === "es" ? "contacto" : "contact")} className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 text-xs font-semibold text-white hover:bg-white/10">{t.contact} ↗</Link>
              {directLink && <Link href={"/" + lang + "/projects/" + project.slug} className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-3 text-xs font-semibold text-slate-400 hover:text-white">{t.open} ↗</Link>}
            </div>
          </div>
        </div>
        <div className="relative min-h-44 overflow-hidden border-t border-white/10 bg-[#0a1528] sm:min-h-[250px] lg:min-h-64 lg:border-l lg:border-t-0">
          <ProjectArtwork key={project.slug} project={project} sizes="(max-width:1024px) 100vw, 55vw" priority={project.slug === "acreditaciones-app" && !compact} />
          <span className="absolute bottom-2 left-3 rounded-full border border-white/10 bg-[#101b30]/90 px-2.5 py-1 text-[.62rem] text-slate-300 backdrop-blur">{t.synthetic}</span>
        </div>
      </div>
      {project.demo === "acreditaciones-ai" && aiOpen && (
        <div className="border-t border-violet-300/20 bg-[#090f20] p-3 sm:p-5">
          <AcreditacionesDemo lang={lang} compact />
        </div>
      )}
    </article>
  );
}
