import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectShowcase } from "@/components/project-showcase";
import { SiteHeader } from "@/components/site-header";
import { siteContent } from "@/content/site-content";
import { isLocale } from "@/lib/i18n";

type HomePageProps = {
  params: Promise<{
    lang: string;
  }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const content = siteContent[lang];

  const sectionIds =
    lang === "es"
      ? {
          projects: "proyectos",
          services: "servicios",
          process: "proceso",
          about: "sobre-mi",
        }
      : {
          projects: "projects",
          services: "services",
          process: "process",
          about: "about",
        };

  const contactSubject =
    lang === "es"
      ? "Consulta sobre desarrollo de software"
      : "Software development inquiry";

  const currentYear = new Date().getFullYear();

  return (
    <>
      <SiteHeader lang={lang} content={content} />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
          <div
            className="pointer-events-none absolute inset-0 surface-grid opacity-65"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:px-10 lg:py-32">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.7rem] font-semibold leading-5 text-emerald-800 sm:px-4 sm:text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                {content.hero.availability}
              </div>

              <h1 className="max-w-4xl text-balance text-[2.35rem] font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[4.25rem] lg:leading-[1.04]">
                {content.hero.title}
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:mt-7 sm:text-lg sm:leading-8">
                {content.hero.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <Link
                  href={`/${lang}#${sectionIds.projects}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {content.hero.primaryAction}
                  <span className="ml-2" aria-hidden="true">
                    ↓
                  </span>
                </Link>

                <a
                  href={`mailto:jarce-s03@hotmail.com?subject=${encodeURIComponent(
                    contactSubject,
                  )}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-slate-950"
                >
                  {content.hero.secondaryAction}
                </a>
              </div>

              <div className="mt-9 border-t border-slate-200 pt-6 sm:mt-11 sm:pt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {content.hero.technologiesLabel}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2.5 sm:gap-x-5 sm:gap-y-3">
                  {content.hero.technologies.map((technology) => (
                    <span
                      key={technology}
                      className="text-sm font-semibold text-slate-700"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-5 rounded-[2.4rem] bg-cyan-200/35 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative">
                <ProjectShowcase
                  items={content.projectsSection.projects[0].gallery}
                  priority
                  compact
                />
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-7xl border-t border-slate-200 px-4 sm:px-8 lg:px-10">
            <div className="grid grid-cols-3">
              {content.hero.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`px-2 py-5 text-center sm:px-6 sm:py-7 sm:text-left ${
                    index > 0 ? "border-l border-slate-200" : ""
                  }`}
                >
                  <p className="text-base font-bold leading-tight text-slate-950 sm:text-xl">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[0.68rem] leading-4 text-slate-500 sm:text-sm">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id={sectionIds.projects}
          className="scroll-mt-24 bg-white py-20 sm:py-28 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="section-eyebrow">
                {content.projectsSection.eyebrow}
              </p>
              <h2 className="section-title">
                {content.projectsSection.title}
              </h2>
              <p className="section-description">
                {content.projectsSection.description}
              </p>
            </div>

            <div className="mt-12 space-y-16 sm:mt-16 sm:space-y-20">
              {content.projectsSection.projects.map((project, index) => (
                <article
                  key={project.title}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                    <ProjectShowcase
                      items={project.gallery}
                      priority={index === 0}
                    />
                  </div>

                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-5">
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">
                        {project.status}
                      </span>

                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                      {project.title}
                    </h3>

                    <p className="mt-4 text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
                      {project.description}
                    </p>

                    <ul className="mt-6 space-y-3 sm:mt-7 sm:space-y-4">
                      {project.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-3 text-sm leading-6 text-slate-700"
                        >
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600"
                            aria-hidden="true"
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 flex flex-wrap gap-2 sm:mt-8">
                      {project.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>

                    {project.externalUrl && project.externalLabel ? (
                      <a
                        href={project.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 inline-flex min-h-11 items-center text-sm font-bold text-slate-950 underline decoration-cyan-500 decoration-2 underline-offset-8 sm:mt-9"
                      >
                        {project.externalLabel}
                        <span className="ml-2" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id={sectionIds.services}
          className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-20 sm:py-28 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="section-eyebrow">
                  {content.servicesSection.eyebrow}
                </p>
                <h2 className="section-title">
                  {content.servicesSection.title}
                </h2>
                <p className="section-description">
                  {content.servicesSection.description}
                </p>
              </div>

              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {content.servicesSection.services.map((service) => (
                  <article
                    key={service.number}
                    className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-4 sm:py-8"
                  >
                    <span className="font-mono text-sm font-bold text-cyan-700">
                      {service.number}
                    </span>

                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">
                        {service.title}
                      </h3>
                      <p className="mt-3 leading-7 text-slate-600">
                        {service.description}
                      </p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                        {service.details}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id={sectionIds.process}
          className="scroll-mt-24 bg-slate-950 py-20 text-white sm:py-28 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="section-eyebrow section-eyebrow-dark">
                {content.processSection.eyebrow}
              </p>
              <h2 className="section-title text-white">
                {content.processSection.title}
              </h2>
              <p className="section-description text-slate-400">
                {content.processSection.description}
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-slate-800 bg-slate-800 sm:mt-16 md:grid-cols-2 xl:grid-cols-4">
              {content.processSection.steps.map((step) => (
                <article
                  key={step.number}
                  className="bg-slate-950 p-6 sm:min-h-56 sm:p-8"
                >
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    {step.number}
                  </span>
                  <h3 className="mt-8 text-xl font-semibold sm:mt-12">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400 sm:mt-4">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="section-eyebrow">
                {content.valueSection.eyebrow}
              </p>
              <h2 className="section-title">
                {content.valueSection.title}
              </h2>
            </div>

            <div className="mt-10 grid gap-x-12 gap-y-8 sm:mt-14 sm:grid-cols-2 sm:gap-y-10">
              {content.valueSection.items.map((item) => (
                <article
                  key={item.title}
                  className="border-t border-slate-200 pt-5 sm:pt-6"
                >
                  <h3 className="text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id={sectionIds.about}
          className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-20 sm:py-28 lg:py-32"
        >
          <div className="mx-auto grid max-w-7xl gap-9 px-4 sm:px-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:px-10">
            <div className="flex min-h-60 items-center justify-center rounded-[2rem] border border-slate-200 bg-white sm:min-h-80">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-950 text-2xl font-bold text-white sm:h-28 sm:w-28 sm:text-3xl">
                  JA
                </div>
                <p className="mt-5 text-sm font-bold text-slate-950">
                  Jorge Arce
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Full Stack Software Engineer
                </p>
              </div>
            </div>

            <div>
              <p className="section-eyebrow">
                {content.aboutSection.eyebrow}
              </p>
              <h2 className="section-title">
                {content.aboutSection.title}
              </h2>

              <div className="mt-6 space-y-4 text-base leading-7 text-slate-600 sm:mt-7 sm:space-y-5 sm:text-lg sm:leading-8">
                {content.aboutSection.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2 sm:mt-9">
                {content.aboutSection.facts.map((fact) => (
                  <span
                    key={fact}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    {fact}
                  </span>
                ))}
              </div>

              <a
                href="https://www.linkedin.com/in/jorge-arce-solano"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-11 items-center text-sm font-bold text-slate-950 underline decoration-cyan-500 decoration-2 underline-offset-8 sm:mt-9"
              >
                {content.aboutSection.linkedinLabel}
                <span className="ml-2" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white sm:py-28 lg:py-32">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-8">
            <p className="section-eyebrow section-eyebrow-dark">
              {content.contactSection.eyebrow}
            </p>

            <h2 className="mx-auto mt-5 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {content.contactSection.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:mt-6 sm:text-lg sm:leading-8">
              {content.contactSection.description}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-9 sm:flex-row">
              <a
                href={`mailto:jarce-s03@hotmail.com?subject=${encodeURIComponent(
                  contactSubject,
                )}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-slate-950 transition hover:bg-cyan-50"
              >
                {content.contactSection.primaryAction}
              </a>

              <a
                href="https://www.linkedin.com/in/jorge-arce-solano"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-700 px-6 text-sm font-bold text-white transition hover:border-slate-400"
              >
                {content.contactSection.secondaryAction}
              </a>
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
