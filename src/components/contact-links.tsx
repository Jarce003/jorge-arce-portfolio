import type { Locale } from "@/lib/i18n";

type ContactLinksProps = {
  lang: Locale;
  tone?: "light" | "dark";
  showDetails?: boolean;
};

const phoneDisplay = "+506 8328-7094";
const whatsappNumber = "50683287094";
const linkedinDisplay = "linkedin.com/in/jorge-arce-solano";
const linkedinUrl = "https://www.linkedin.com/in/jorge-arce-solano";
const githubDisplay = "github.com/Jarce003";
const githubUrl = "https://github.com/Jarce003";

export function ContactLinks({
  lang,
  tone = "light",
  showDetails = true,
}: ContactLinksProps) {
  const isSpanish = lang === "es";

  const whatsappMessage = isSpanish
    ? "Hola Jorge, vi tu portafolio y me gustaría conversar sobre un proyecto."
    : "Hi Jorge, I saw your portfolio and I’d like to discuss a project with you.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  const resumeUrl = isSpanish
    ? "/cv/Jorge-Arce-Solano-CV-ES.pdf"
    : "/cv/Jorge-Arce-Solano-CV-EN.pdf";

  const primaryClass =
    tone === "dark"
      ? "bg-white text-slate-950 hover:bg-cyan-50"
      : "bg-slate-950 text-white hover:bg-slate-800";

  const secondaryClass =
    tone === "dark"
      ? "border-slate-700 text-white hover:border-slate-400"
      : "border-slate-300 bg-white text-slate-800 hover:border-slate-950";

  const detailClass =
    tone === "dark"
      ? "border-slate-800 bg-slate-900/70 text-slate-300"
      : "border-slate-200 bg-white text-slate-600";

  const detailLabelClass =
    tone === "dark" ? "text-slate-500" : "text-slate-400";

  const labels = isSpanish
    ? {
        whatsapp: "Escribirme por WhatsApp",
        resume: "Descargar CV",
        linkedin: "LinkedIn",
        github: "GitHub",
        phoneLabel: "WhatsApp",
      }
    : {
        whatsapp: "Message me on WhatsApp",
        resume: "Download resume",
        linkedin: "LinkedIn",
        github: "GitHub",
        phoneLabel: "WhatsApp",
      };

  return (
    <div>
      <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition ${primaryClass}`}
        >
          {labels.whatsapp}
        </a>

        <a
          href={resumeUrl}
          download
          className={`inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold transition ${secondaryClass}`}
        >
          {labels.resume}
        </a>

        <a
          href={linkedinUrl}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold transition ${secondaryClass}`}
        >
          {labels.linkedin}
        </a>

        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold transition ${secondaryClass}`}
        >
          {labels.github}
        </a>
      </div>

      {showDetails ? (
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${detailClass}`}
          >
            <span
              className={`block text-[0.68rem] font-bold uppercase tracking-[0.16em] ${detailLabelClass}`}
            >
              {labels.phoneLabel}
            </span>
            <span className="mt-2 block text-sm font-semibold">
              {phoneDisplay}
            </span>
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${detailClass}`}
          >
            <span
              className={`block text-[0.68rem] font-bold uppercase tracking-[0.16em] ${detailLabelClass}`}
            >
              LinkedIn
            </span>
            <span className="mt-2 block break-all text-sm font-semibold">
              {linkedinDisplay}
            </span>
          </a>

          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${detailClass}`}
          >
            <span
              className={`block text-[0.68rem] font-bold uppercase tracking-[0.16em] ${detailLabelClass}`}
            >
              GitHub
            </span>
            <span className="mt-2 block break-all text-sm font-semibold">
              {githubDisplay}
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}