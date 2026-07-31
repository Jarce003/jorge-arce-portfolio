import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type ContactSectionProps = {
  lang: Locale;
  content: SiteContent;
};

const contactLabels = {
  es: {
    whatsappLabel: "WhatsApp",
    emailLabel: "Correo",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
    resumeLabel: "Currículum",
    resumeAction: "Descargar CV",
  },
  en: {
    whatsappLabel: "WhatsApp",
    emailLabel: "Email",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
    resumeLabel: "Resume",
    resumeAction: "Download resume",
  },
} satisfies Record<
  Locale,
  {
    whatsappLabel: string;
    emailLabel: string;
    linkedinLabel: string;
    githubLabel: string;
    resumeLabel: string;
    resumeAction: string;
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

  const emailSubject =
    lang === "es" ? "Consulta desde el portafolio" : "Portfolio inquiry";

  const emailUrl = `mailto:jarce-s03@hotmail.com?subject=${encodeURIComponent(
    emailSubject,
  )}`;

  const resumeUrl =
    lang === "es"
      ? "/cv/Jorge-Arce-Solano-CV-ES.pdf"
      : "/cv/Jorge-Arce-Solano-CV-EN.pdf";

  const contactItems = [
    {
      label: labels.whatsappLabel,
      value: "+506 8328-7094",
      href: whatsappUrl,
    },
    {
      label: labels.emailLabel,
      value: "jarce-s03@hotmail.com",
      href: emailUrl,
    },
    {
      label: labels.linkedinLabel,
      value: "linkedin.com/in/jorge-arce-solano",
      href: "https://www.linkedin.com/in/jorge-arce-solano",
    },
    {
      label: labels.githubLabel,
      value: "github.com/Jarce003",
      href: "https://github.com/Jarce003",
    },
    {
      label: labels.resumeLabel,
      value: labels.resumeAction,
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

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
            {contactItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                download={item.download}
                className={`block px-6 py-6 transition hover:bg-slate-900 sm:px-8 ${
                  index > 0 ? "border-t border-slate-800" : ""
                }`}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.16em] text-cyan-400">
                  {item.label}
                </span>

                <span className="mt-2 block break-words text-base font-semibold text-white sm:text-lg">
                  {item.value}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
