import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectPanel } from "@/components/projects/project-panel";
import { SiteHeader } from "@/components/site-header";
import { getProject, projectDefinitions } from "@/content/projects";
import { siteContent } from "@/content/site-content";
import { isLocale, locales } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string; slug: string }> };
export const dynamicParams = false;

// Each new project automatically receives a bilingual shareable page.
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    projectDefinitions.map((project) => ({ lang, slug: project.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = getProject(lang, slug);
  if (!project) notFound();
  return {
    title: project.title + " | JarceDev",
    description: project.problem + " " + project.solution,
    alternates: {
      canonical: "/" + lang + "/projects/" + project.slug,
      languages: {
        es: "/es/projects/" + project.slug,
        en: "/en/projects/" + project.slug,
      },
    },
    openGraph: {
      title: project.title + " | JarceDev",
      description: project.solution,
      images: [{ url: project.preview, alt: project.previewAlt }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = getProject(lang, slug);
  if (!project) notFound();

  const t = lang === "es"
    ? {
      backWorld: "Volver al mundo",
      backAll: "Todos los proyectos",
      eyebrow: "PROYECTO / JARCEDEV",
      explain: "Del problema a la solución, sin información innecesaria.",
      role: "Mi aporte: identificar oportunidades, definir requisitos y validar el resultado. La programación se realiza con IA.",
    }
    : {
      backWorld: "Back to the world",
      backAll: "All projects",
      eyebrow: "PROJECT / JARCEDEV",
      explain: "From problem to solution, without unnecessary details.",
      role: "My role: identify opportunities, define requirements and validate outcomes. Coding is AI-assisted.",
    };

  return (
    <>
      <SiteHeader lang={lang} content={siteContent[lang]} />
      <main className="min-h-[calc(100svh-80px)] bg-[#081426] px-4 py-7 text-white sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-2">
            <Link href={"/" + lang + "#mundo"} className="inline-flex min-h-10 items-center rounded-full border border-white/20 bg-white/5 px-4 text-xs font-semibold text-violet-200 hover:bg-white/10">← {t.backWorld}</Link>
            <Link href={"/" + lang + "/portfolio#" + (lang === "es" ? "proyectos" : "projects")} className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-slate-200 hover:bg-white/10">{t.backAll} ↗</Link>
          </div>
          <p className="mt-9 text-[.66rem] font-bold tracking-[.2em] text-violet-300">{t.eyebrow}</p>
          <p className="mb-5 mt-1 text-sm text-slate-300">{t.explain}</p>
          <ProjectPanel lang={lang} project={project} showAiByDefault={project.demo === "acreditaciones-ai"} directLink={false} />
          <p className="mt-5 text-xs leading-6 text-slate-400">{t.role}</p>
        </div>
      </main>
    </>
  );
}
