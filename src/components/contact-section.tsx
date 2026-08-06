import { ContactForm } from "@/components/contact-form";
import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type ContactSectionProps = {
  lang: Locale;
  content: SiteContent;
};

const contactLabels = {
  es: {
    alternatives: "También puedes contactarme por",
    whatsappLabel: "WhatsApp",
    whatsappValue: "Escribir por WhatsApp",
    linkedinLabel: "LinkedIn",
    linkedinValue: "Ver perfil profesional",
    githubLabel: "GitHub",
    githubValue: "Ver repositorios",
    resumeLabel: "Currículum",
    resumeValue: "Descargar CV",
  },
  en: {
    alternatives: "You can also contact me through",
    whatsappLabel: "WhatsApp",
    whatsappValue: "Message me on WhatsApp",
    linkedinLabel: "LinkedIn",
    linkedinValue: "View professional profile",
    githubLabel: "GitHub",
    githubValue: "View repositories",
    resumeLabel: "Resume",
    resumeValue: "Download resume",
  },
} satisfies Record<
  Locale,
  {
    alternatives: string;
    whatsappLabel: string;
    whatsappValue: string;
    linkedinLabel: string;
    linkedinValue: string;
    githubLabel: string;
    githubValue: string;
    resumeLabel: string;
    resumeValue: string;
  }
>;

export function ContactSection({
  lang,
  content,
}: ContactSectionProps) {
  const labels = contactLabels[lang];
  const sectionId = lang === "es" ? "contacto" : "contact";

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

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
    (process.env.NODE_ENV === "development"
      ? "1x00000000000000000000AA"
      : "");

  const alternatives = [
    {
      label: labels.whatsappLabel,
      value: labels.whatsappValue,
      href: whatsappUrl,
    },
    {
      label: labels.linkedinLabel,
      value: labels.linkedinValue,
      href: "https://www.linkedin.com/in/jorge-arce-solano",
    },
    {
      label: labels.githubLabel,
      value: labels.githubValue,
      href: "https://github.com/Jarce003",
    },
    {
      label: labels.resumeLabel,
      value: labels.resumeValue,
      href: resumeUrl,
      download: true,
    },
  ];

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 bg-slate-950 py-20 text-white sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
          <div>
            <p className="section-eyebrow section-eyebrow-dark">
              {content.contactSection.eyebrow}
            </p>

            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {content.contactSection.title}
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              {content.contactSection.description}
            </p>
          </div>

          <div>
            <ContactForm lang={lang} siteKey={siteKey} />

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {labels.alternatives}
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {alternatives.map((item) => {
                  const external = item.href.startsWith("http");

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      download={item.download}
                      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-600 hover:bg-slate-900"
                    >
                      <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-cyan-400">
                        {item.label}
                      </span>

                      <span className="mt-2 block text-sm font-semibold text-white">
                        {item.value}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}