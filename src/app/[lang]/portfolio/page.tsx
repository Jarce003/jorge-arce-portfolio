import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContactSection } from "@/components/contact-section";
import { ProfileSection } from "@/components/profile-section";
import { ProjectShowcase } from "@/components/project-showcase";
import { SiteHeader } from "@/components/site-header";
import { siteContent } from "@/content/site-content";
import { isLocale } from "@/lib/i18n";

type PortfolioPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return {
    title: lang === "es" ? "Proyectos y perfil profesional" : "Projects & professional profile",
    description: siteContent[lang].projectsSection.description,
    alternates: {
      canonical: "/" + lang + "/portfolio",
      languages: { es: "/es/portfolio", en: "/en/portfolio" },
    },
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = siteContent[lang];
  const sections = lang === "es"
    ? { projects: "proyectos", services: "servicios", process: "proceso", about: "sobre-mi" }
    : { projects: "projects", services: "services", process: "process", about: "about" };
  const words = lang === "es"
    ? {
      back: "Volver al mundo 3D",
      kicker: "JARCEDEV / PERFIL Y PROYECTOS",
      headline: "Los procesos cambian. Las soluciones también.",
      note: "El mundo 3D es la entrada principal a JarceDev. Aquí puedes consultar, de manera directa, los proyectos, mi metodología y los medios de contacto.",
      explore: "Explorar el mundo",
      method: "Mi método de trabajo",
      technology: "Tecnologías utilizadas en el proyecto",
      ai: "Desarrollo con IA",
    }
    : {
      back: "Back to the 3D world",
      kicker: "JARCEDEV / PROFILE & PROJECTS",
      headline: "Processes evolve. Solutions should too.",
      note: "The 3D world is the main JarceDev experience. This page provides direct access to my projects, approach and contact options.",
      explore: "Explore the world",
      method: "How I work",
      technology: "Technologies used in this project",
      ai: "AI-assisted implementation",
    };

  return (
    <>
      <SiteHeader lang={lang} content={content} />
      <main>
        <section className="relative overflow-hidden bg-[#0b182c] px-4 py-16 text-white sm:px-8 sm:py-24">
          <div className="pointer-events-none absolute -right-36 top-0 size-96 rounded-full bg-violet-400/15 blur-[90px]" />
          <div className="relative mx-auto max-w-6xl">
            <Link
              href={"/" + lang + "#mundo"}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-violet-300/35 bg-violet-400/10 px-5 text-sm font-semibold text-violet-100 hover:border-violet-200 hover:bg-violet-400/20"
            >
              <span aria-hidden="true">←</span> {words.back}
            </Link>
            <p className="mt-11 text-xs font-bold uppercase tracking-[.20em] text-violet-300">{words.kicker}</p>
            <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.06] tracking-[-.05em] sm:text-6xl">
              {words.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">{words.note}</p>
          </div>
        </section>

        <section id={sections.projects} className="scroll-mt-24 bg-[#f8f9fc] px-4 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="section-eyebrow">{content.projectsSection.eyebrow}</p>
            <h2 className="section-title">{content.projectsSection.title}</h2>
            <p className="section-description">{content.projectsSection.description}</p>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:gap-8">
              {content.projectsSection.projects.map((project) => (
                <article key={project.slug} className="flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40 sm:p-7">
                  <div className="min-w-0">
                    <ProjectShowcase items={project.gallery} project={project.slug} lang={lang} />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{project.title}</h3>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-[.7rem] font-semibold text-violet-800">{project.status}</span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{project.description}</p>
                  <p className="mt-5 text-[.68rem] font-bold uppercase tracking-[.14em] text-slate-500">{words.technology}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.technologies.map((technology) => (
                      <span key={technology} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[.7rem] font-semibold text-slate-600">{technology}</span>
                    ))}
                  </div>
                  <Link href={"/" + lang + "/projects/" + project.slug} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800">
                    {project.caseStudyLabel} <span className="ml-2" aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id={sections.process} className="scroll-mt-24 bg-slate-950 px-4 py-16 text-white sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[.20em] text-violet-300">{content.processSection.eyebrow}</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">{content.processSection.title}</h2>
            <p className="mt-4 max-w-3xl leading-8 text-slate-300">{content.processSection.description}</p>
            <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {content.processSection.steps.map((step) => (
                <article key={step.number} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="font-mono text-sm font-bold text-violet-300">{step.number}</p>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-4xl border-t border-white/15 pt-6 text-sm leading-7 text-slate-400">
              <span className="font-bold text-violet-300">{words.ai}.</span> {content.aiSection.description}
            </p>
          </div>
        </section>

        <section id={sections.services} className="scroll-mt-24 bg-white px-4 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="section-eyebrow">{content.servicesSection.eyebrow}</p>
            <h2 className="section-title">{content.servicesSection.title}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {content.servicesSection.services.map((service) => (
                <article key={service.number} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <span className="font-mono text-xs font-bold text-violet-700">{service.number}</span>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProfileSection lang={lang} content={content} sectionId={sections.about} />
        <ContactSection lang={lang} content={content} />
      </main>
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Jorge Arce · {content.footer.rights} · <Link href={"/" + lang} className="font-semibold text-violet-300 hover:text-white">{words.explore} ↗</Link>
      </footer>
    </>
  );
}
