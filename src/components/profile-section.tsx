import Image from "next/image";

import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type ProfileSectionProps = {
  lang: Locale;
  content: SiteContent;
  sectionId: string;
};

const profileLabels = {
  es: {
    role: "Full Stack Software Engineer",
    whatsapp: "Escribirme por WhatsApp",
    resume: "Descargar CV",
    linkedin: "LinkedIn",
    github: "GitHub",
    photoAlt: "Jorge Arce Solano, Full Stack Software Engineer",
  },
  en: {
    role: "Full Stack Software Engineer",
    whatsapp: "Message me on WhatsApp",
    resume: "Download resume",
    linkedin: "LinkedIn",
    github: "GitHub",
    photoAlt: "Jorge Arce Solano, Full Stack Software Engineer",
  },
} satisfies Record<
  Locale,
  {
    role: string;
    whatsapp: string;
    resume: string;
    linkedin: string;
    github: string;
    photoAlt: string;
  }
>;

export function ProfileSection({
  lang,
  content,
  sectionId,
}: ProfileSectionProps) {
  const labels = profileLabels[lang];

  const whatsappMessage =
    lang === "es"
      ? "Hola Jorge, vi tu portafolio y me gustaría conversar sobre un proyecto."
      : "Hi Jorge, I saw your portfolio and I would like to discuss a project with you.";

  const whatsappUrl = `https://wa.me/50683287094?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  const resumeUrl =
    lang === "es"
      ? "/cv/Jorge-Arce-Solano-CV-ES.pdf"
      : "/cv/Jorge-Arce-Solano-CV-EN.pdf";

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-16 lg:px-10">
        <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 lg:mx-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] bg-slate-200">
            <Image
              src="/profile/jorge-arce-centered.webp"
              alt={labels.photoAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 360px"
              className="object-cover object-center"
            />
          </div>

          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/30 bg-slate-950/85 px-5 py-4 text-white shadow-lg backdrop-blur-md">
            <p className="text-base font-bold">Jorge Arce Solano</p>
            <p className="mt-1 text-sm text-slate-300">{labels.role}</p>
          </div>
        </div>

        <div>
          <p className="section-eyebrow">{content.aboutSection.eyebrow}</p>

          <h2 className="section-title">{content.aboutSection.title}</h2>

          <div className="mt-7 space-y-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            {content.aboutSection.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {content.aboutSection.facts.map((fact) => (
              <span
                key={fact}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                {fact}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              {labels.whatsapp}
            </a>

            <a
              href={resumeUrl}
              download
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 transition hover:border-slate-950"
            >
              {labels.resume}
            </a>

            <a
              href="https://www.linkedin.com/in/jorge-arce-solano"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-950"
            >
              {labels.linkedin}
            </a>

            <a
              href="https://github.com/Jarce003"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-950"
            >
              {labels.github}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
