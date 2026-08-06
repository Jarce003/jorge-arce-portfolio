import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectShowcase } from "@/components/project-showcase";
import { SiteHeader } from "@/components/site-header";
import {
  caseStudies,
  caseStudySlugs,
  isCaseStudySlug,
} from "@/content/case-studies";
import { siteContent } from "@/content/site-content";
import { isLocale, locales } from "@/lib/i18n";

type CaseStudyPageProps = {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    caseStudySlugs.map((slug) => ({ lang, slug })),
  );
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  if (!isLocale(lang) || !isCaseStudySlug(slug)) {
    notFound();
  }

  const study = caseStudies[lang][slug];

  return {
    title: study.metadata.title,
    description: study.metadata.description,
    alternates: {
      canonical: `/${lang}/projects/${slug}`,
      languages: {
        es: `/es/projects/${slug}`,
        en: `/en/projects/${slug}`,
      },
    },
  };
}

export default async function CaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const { lang, slug } = await params;

  if (!isLocale(lang) || !isCaseStudySlug(slug)) {
    notFound();
  }

  const content = siteContent[lang];
  const study = caseStudies[lang][slug];
  const projectsId = lang === "es" ? "proyectos" : "projects";

  const secondaryHref =
    slug === "firetrack"
      ? "https://firetrackcr.com"
      : `/${lang}/projects/firetrack`;
  const secondaryExternal = slug === "firetrack";
  const currentYear = new Date().getFullYear();

  return (
    <>
      <SiteHeader lang={lang} content={content} />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
          <div
            className="pointer-events-none absolute inset-0 surface-grid opacity-60"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <Link
              href={`/${lang}#${projectsId}`}
              className="inline-flex min-h-11 items-center text-sm font-bold text-slate-700 transition hover:text-slate-950"
            >
              <span className="mr-2" aria-hidden="true">
                ←
              </span>
              {study.breadcrumb}
            </Link>

            <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
              <div>
                <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">
                  {study.status}
                </span>

                <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl">
                  {study.title}
                </h1>

                <p className="mt-5 text-pretty text-xl font-medium leading-8 text-slate-800 sm:text-2xl sm:leading-9">
                  {study.subtitle}
                </p>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  {study.introduction}
                </p>
              </div>

              <ProjectShowcase
                items={study.gallery}
                priority
              />
            </div>

            <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-4">
              {study.facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={`p-4 sm:p-5 ${
                    index % 2 === 1 ? "border-l border-slate-200" : ""
                  } ${
                    index >= 2
                      ? "border-t border-slate-200 sm:border-t-0"
                      : ""
                  } ${index >= 1 ? "sm:border-l sm:border-slate-200" : ""}`}
                >
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
            <article>
              <p className="section-eyebrow">{study.problem.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {study.problem.title}
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
                {study.problem.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <article className="border-t border-slate-200 pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
              <p className="section-eyebrow">{study.solution.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {study.solution.title}
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
                {study.solution.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10">
            <div>
              <p className="section-eyebrow">{study.role.eyebrow}</p>
              <h2 className="section-title">{study.role.title}</h2>
              <p className="section-description">{study.role.description}</p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
              {study.role.areas.map((area, index) => (
                <div key={area} className="bg-white p-6 sm:p-7">
                  <span className="font-mono text-xs font-bold text-cyan-700">
                    0{index + 1}
                  </span>
                  <p className="mt-5 font-semibold leading-7 text-slate-900">
                    {area}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="section-eyebrow section-eyebrow-dark">
                {study.decisions.eyebrow}
              </p>
              <h2 className="section-title text-white">
                {study.decisions.title}
              </h2>
              <p className="section-description text-slate-400">
                {study.decisions.description}
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-slate-800 bg-slate-800 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
              {study.decisions.items.map((item, index) => (
                <article key={item.title} className="bg-slate-950 p-6 sm:p-8">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    0{index + 1}
                  </span>
                  <h3 className="mt-8 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="section-eyebrow">{study.capabilities.eyebrow}</p>
              <h2 className="section-title">{study.capabilities.title}</h2>
            </div>

            <div className="mt-12 grid gap-x-12 gap-y-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
              {study.capabilities.items.map((item) => (
                <article key={item.title} className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>


        <section className="bg-white py-20 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:gap-20 lg:px-10">
            <div>
              <p className="section-eyebrow">{study.outcome.eyebrow}</p>
              <h2 className="section-title">{study.outcome.title}</h2>
              <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-slate-600">
                {study.outcome.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                {lang === "es" ? "Evidencia verificable" : "Verifiable signals"}
              </p>
              <div className="mt-6 space-y-4">
                {study.outcome.signals.map((signal) => (
                  <div key={signal} className="flex gap-3">
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-600"
                      aria-hidden="true"
                    />
                    <p className="font-semibold leading-6 text-slate-800">
                      {signal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white sm:py-28 lg:py-32">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-8">
            <p className="section-eyebrow section-eyebrow-dark">
              {lang === "es" ? "Siguiente paso" : "Next step"}
            </p>
            <h2 className="mx-auto mt-5 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {study.cta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:mt-6 sm:text-lg sm:leading-8">
              {study.cta.description}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-9 sm:flex-row">
              <Link
                href={`/${lang}#${lang === "es" ? "contacto" : "contact"}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-slate-950 transition hover:bg-cyan-50"
              >
                {study.cta.primaryAction}
              </Link>

              {secondaryExternal ? (
                <a
                  href={secondaryHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-700 px-6 text-sm font-bold text-white transition hover:border-slate-400"
                >
                  {study.cta.secondaryAction}
                </a>
              ) : (
                <Link
                  href={secondaryHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-700 px-6 text-sm font-bold text-white transition hover:border-slate-400"
                >
                  {study.cta.secondaryAction}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>{content.footer.description}</p>
          <p>
            © {currentYear} Jorge Arce. {content.footer.rights}
          </p>
        </div>
      </footer>
    </>
  );
}
