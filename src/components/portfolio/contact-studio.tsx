"use client";

import { useMemo, useRef, useState } from "react";

import { ContactForm } from "@/components/contact-form";
import type { Locale } from "@/lib/i18n";

type Topic = "process" | "collaboration" | "opportunity";

const ui = {
  es: {
    eyebrow: "SIGUIENTE PASO",
    headline: "¿Tienes algo que mejorar?",
    cta: "Hablemos",
    intro: "Empecemos con una pregunta.",
    question: "¿Sobre qué quieres conversar?",
    topics: {
      process: "Un proceso que podría mejorar",
      collaboration: "Colaborar en una idea",
      opportunity: "Una oportunidad profesional",
    },
    label: "Cuéntame en una frase (opcional)",
    placeholder: "Por ejemplo: usamos varios archivos para controlar las inspecciones...",
    sendWhatsapp: "Continuar por WhatsApp",
    sendEmail: "Usar formulario",
    close: "Cerrar",
    hideEmail: "Volver a las opciones",
    notice: "Solo se envía cuando confirmes en WhatsApp o completes el formulario.",
  },
  en: {
    eyebrow: "NEXT STEP",
    headline: "Have something to improve?",
    cta: "Let's talk",
    intro: "Start with one question.",
    question: "What would you like to discuss?",
    topics: {
      process: "A workflow that could improve",
      collaboration: "Collaborating on an idea",
      opportunity: "A professional opportunity",
    },
    label: "One sentence about it (optional)",
    placeholder: "For example: inspections are tracked in separate spreadsheets...",
    sendWhatsapp: "Continue on WhatsApp",
    sendEmail: "Use contact form",
    close: "Close",
    hideEmail: "Back to choices",
    notice: "Nothing is sent until you confirm in WhatsApp or submit the contact form.",
  },
} as const;

export function ContactStudio({ lang, siteKey }: { lang: Locale; siteKey: string }) {
  const t = ui[lang];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [topic, setTopic] = useState<Topic>("process");
  const [detail, setDetail] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailRevision, setEmailRevision] = useState(0);

  const message = useMemo(() => {
    const greeting = lang === "es"
      ? "Hola, encontré JarceDev. Me gustaría conversar sobre:"
      : "Hi, I found JarceDev. I'd like to discuss:";
    return [greeting, t.topics[topic], ...(detail.trim() ? ["", detail.trim()] : [])].join("\n");
  }, [detail, lang, t, topic]);

  const whatsappUrl = "https://wa.me/50683287094?text=" + encodeURIComponent(message);

  const open = () => {
    setEmailOpen(false);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <section id={lang === "es" ? "contacto" : "contact"} className="scroll-mt-24 bg-[#0b1628] px-4 py-8 text-white sm:px-8 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[.65rem] font-bold tracking-[.17em] text-violet-300">{t.eyebrow}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{t.headline}</h2>
          </div>
          <button type="button" ref={triggerRef} onClick={open} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-violet-300 px-6 text-sm font-bold text-slate-950 transition-colors hover:bg-violet-200">
            <span aria-hidden="true">✉</span> {t.cta} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>

      <button type="button" onClick={open} className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] right-3 z-40 flex min-h-11 items-center gap-2 rounded-full border border-violet-200/40 bg-[#141f3b]/95 px-4 text-xs font-bold text-white shadow-[0_7px_32px_rgba(12,15,30,.45)] backdrop-blur-md transition-colors hover:bg-[#29345c] sm:bottom-6 sm:right-6" aria-label={t.cta}>
        <span aria-hidden="true">✉</span> {t.cta}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="contact-studio-title"
        onClose={() => { setEmailOpen(false); triggerRef.current?.focus(); }}
        className="fixed inset-0 m-auto max-h-[min(92svh,760px)] w-[min(92vw,540px)] overflow-y-auto rounded-[1.5rem] border border-violet-200/25 bg-[#0b1628] p-0 text-white shadow-2xl backdrop:bg-[#030816]/85 backdrop:backdrop-blur-sm"
      >
        <div className="p-4 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[.66rem] font-bold tracking-[.17em] text-violet-300">{t.intro}</p>
              <h2 id="contact-studio-title" className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{t.question}</h2>
            </div>
            <button type="button" onClick={close} aria-label={t.close} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-xl hover:bg-white/10">×</button>
          </div>

          {!emailOpen ? (
            <>
              <div className="mt-5 grid gap-2" role="group" aria-label={t.question}>
                {(["process", "collaboration", "opportunity"] as const).map((option) => (
                  <button type="button" key={option} onClick={() => setTopic(option)} aria-pressed={topic === option}
                    className={"flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors " + (topic === option ? "border-violet-300 bg-violet-300/15 text-white" : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10")}>
                    {t.topics[option]} <span aria-hidden="true" className={topic === option ? "text-violet-200" : "text-slate-500"}>{topic === option ? "●" : "○"}</span>
                  </button>
                ))}
              </div>

              <label htmlFor={"contact-studio-detail-" + lang} className="mt-5 block text-xs font-semibold text-slate-200">{t.label}</label>
              <textarea id={"contact-studio-detail-" + lang} value={detail} onChange={(event) => setDetail(event.target.value)} maxLength={1200} rows={3}
                placeholder={t.placeholder} className="mt-2 w-full resize-y rounded-xl border border-white/20 bg-[#081120] px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus-visible:border-violet-300" />

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-300 px-3 text-center text-sm font-bold text-slate-950 hover:bg-violet-200">{t.sendWhatsapp} ↗</a>
                <button type="button" onClick={() => { setEmailRevision((x) => x + 1); setEmailOpen(true); }} className="min-h-12 rounded-xl border border-white/20 px-3 text-sm font-bold text-white hover:bg-white/10">{t.sendEmail} →</button>
              </div>
              <p className="mt-3 text-[.68rem] leading-5 text-slate-400">{t.notice}</p>
            </>
          ) : (
            <div className="mt-5">
              <button type="button" onClick={() => setEmailOpen(false)} className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-3.5 text-xs font-semibold text-violet-200 hover:bg-white/10">← {t.hideEmail}</button>
              <ContactForm key={emailRevision} lang={lang} siteKey={siteKey} initialMessage={message} />
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
