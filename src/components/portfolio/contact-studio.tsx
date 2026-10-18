"use client";

import { useMemo, useState } from "react";

import { ContactForm } from "@/components/contact-form";
import type { Locale } from "@/lib/i18n";

type Inquiry = "improve" | "partner" | "career";

const words = {
  es: {
    eyebrow: "EMPECEMOS POR EL PROBLEMA",
    title: "¿Qué te gustaría mejorar?",
    subtitle: "No necesitas tener una solución definida. Cuéntame el proceso, la idea o la oportunidad.",
    question: "Quiero conversar sobre",
    options: {
      improve: ["Mejorar un proceso", "Un procedimiento que podría funcionar mejor"],
      partner: ["Colaborar en un proyecto", "Una iniciativa o colaboración digital"],
      career: ["Una oportunidad profesional", "Un rol, equipo u oportunidad de trabajo"],
    },
    details: "Describe la situación en una frase (opcional)",
    placeholder: "Por ejemplo: gestionamos las solicitudes en varios Excel y perdemos seguimiento...",
    whatsapp: "Escribir por WhatsApp",
    email: "Enviar desde JarceDev",
    emailOpen: "Formulario seguro por correo",
    hide: "Ocultar formulario",
    privacy: "Tu mensaje se prepara en tu dispositivo. No se envía hasta que elijas un canal y confirmes.",
    choose: "Elige un punto de partida",
  },
  en: {
    eyebrow: "START WITH THE PROBLEM",
    title: "What could work better?",
    subtitle: "You don't need a technical specification. Tell me about the workflow, idea or opportunity.",
    question: "I'd like to discuss",
    options: {
      improve: ["Improving a process", "An operational workflow that could be better"],
      partner: ["Collaborating on a project", "A new digital project or collaboration"],
      career: ["A professional opportunity", "A role, team or job opportunity"],
    },
    details: "Describe the situation in one sentence (optional)",
    placeholder: "For example: we track requests in separate spreadsheets and lose visibility...",
    whatsapp: "Continue on WhatsApp",
    email: "Send from JarceDev",
    emailOpen: "Secure email form",
    hide: "Hide form",
    privacy: "Your message is prepared in your browser. Nothing is sent until you select a channel and confirm.",
    choose: "Choose a starting point",
  },
} as const;

export function ContactStudio({ lang, siteKey }: { lang: Locale; siteKey: string }) {
  const t = words[lang];
  const [type, setType] = useState<Inquiry>("improve");
  const [details, setDetails] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [revision, setRevision] = useState(0);

  const message = useMemo(() => {
    const subject = t.options[type][0];
    const introduction = lang === "es"
      ? "Hola, encontré JarceDev y quiero conversar sobre:"
      : "Hi, I found JarceDev and would like to talk about:";
    return [
      introduction,
      subject,
      ...(details.trim() ? ["", details.trim()] : []),
    ].join("\n");
  }, [details, lang, t.options, type]);

  const whatsappUrl = "https://wa.me/50683287094?text=" + encodeURIComponent(message);
  const updateType = (next: Inquiry) => {
    setType(next);
    setShowForm(false);
  };

  return (
    <section id={lang === "es" ? "contacto" : "contact"} className="scroll-mt-24 relative overflow-hidden bg-[#0a1426] px-4 py-16 text-white sm:px-8 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-20 size-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-start gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-[.7rem] font-semibold tracking-[.19em] text-violet-300">{t.eyebrow}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.06] tracking-[-.055em]">{t.title}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">{t.subtitle}</p>
            <div className="mt-7 hidden flex-wrap gap-2 text-[.73rem] text-slate-400 lg:flex">
              <a href="https://www.linkedin.com/in/jorge-arce-solano" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 hover:border-violet-200 hover:text-white">LinkedIn ↗</a>
              <a href="https://github.com/Jarce003" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 hover:border-violet-200 hover:text-white">GitHub ↗</a>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/15 bg-white/[.055] p-4 shadow-xl shadow-black/10 sm:p-6">
            <p className="text-[.72rem] font-semibold uppercase tracking-[.15em] text-slate-400">{t.question}</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t.choose}>
              {(["improve", "partner", "career"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateType(option)}
                  aria-pressed={type === option}
                  className={"min-h-11 rounded-xl border px-3.5 text-left text-xs font-semibold transition-colors sm:text-sm " +
                    (type === option
                      ? "border-violet-300 bg-violet-300 text-[#101323]"
                      : "border-white/20 bg-white/5 text-slate-200 hover:border-violet-300/70")}
                >
                  {t.options[option][0]}
                </button>
              ))}
            </div>

            <label htmlFor={"contact-idea-" + lang} className="mt-6 block text-sm font-semibold text-slate-200">{t.details}</label>
            <textarea
              id={"contact-idea-" + lang}
              value={details}
              onChange={(event) => { setDetails(event.target.value); setShowForm(false); }}
              maxLength={1200}
              rows={3}
              placeholder={t.placeholder}
              className="mt-2 w-full resize-y rounded-xl border border-white/20 bg-[#071221] p-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/15"
            />

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-violet-300 px-4 text-center text-sm font-bold text-[#0b1426] transition hover:bg-violet-200"
              >
                {t.whatsapp} ↗
              </a>
              <button
                type="button"
                onClick={() => { setShowForm((value) => !value); setRevision((value) => value + 1); }}
                aria-expanded={showForm}
                aria-controls="contact-email-panel"
                className="min-h-12 flex-1 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {showForm ? t.hide : t.email} <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="mt-4 text-[.71rem] leading-5 text-slate-400">{t.privacy}</p>

            {showForm && (
              <div id="contact-email-panel" className="mt-5 border-t border-white/15 pt-5">
                <h3 className="mb-3 text-sm font-semibold text-white">{t.emailOpen}</h3>
                <ContactForm key={revision} lang={lang} siteKey={siteKey} initialMessage={message} />
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-3 text-xs text-slate-400 lg:hidden">
          <a href="https://www.linkedin.com/in/jorge-arce-solano" target="_blank" rel="noreferrer" className="min-h-11 rounded-full border border-white/15 px-4 py-3">LinkedIn ↗</a>
          <a href="https://github.com/Jarce003" target="_blank" rel="noreferrer" className="min-h-11 rounded-full border border-white/15 px-4 py-3">GitHub ↗</a>
        </div>
      </div>
    </section>
  );
}
