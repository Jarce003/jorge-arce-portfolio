"use client";

import Script from "next/script";
import { type FormEvent, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n";

declare global {
  interface Window {
    turnstile?: {
      reset: (widgetId?: string | number) => void;
    };
  }
}

type ContactFormProps = {
  lang: Locale;
  siteKey: string;
};

type SubmitStatus = "idle" | "sending" | "success" | "error";

type ApiResponse = {
  ok?: boolean;
  message?: string;
};

const formCopy = {
  es: {
    emailLabel: "Tu correo",
    emailPlaceholder: "nombre@empresa.com",
    messageLabel: "Mensaje",
    messagePlaceholder:
      "Cuéntame brevemente sobre el proyecto, la vacante o el sistema que necesitas mejorar.",
    submit: "Enviar mensaje",
    submitting: "Enviando...",
    success:
      "Mensaje enviado correctamente. Te responderé lo antes posible.",
    error:
      "No fue posible enviar el mensaje. Inténtalo nuevamente en unos minutos.",
    verification:
      "Completa la verificación de seguridad antes de enviar el mensaje.",
    unavailable:
      "El formulario todavía no está configurado. Puedes usar WhatsApp o LinkedIn.",
    privacy:
      "Tu correo se utilizará únicamente para responder este mensaje.",
  },
  en: {
    emailLabel: "Your email",
    emailPlaceholder: "name@company.com",
    messageLabel: "Message",
    messagePlaceholder:
      "Briefly tell me about the project, role or system you need help with.",
    submit: "Send message",
    submitting: "Sending...",
    success:
      "Your message was sent successfully. I will reply as soon as possible.",
    error:
      "The message could not be sent. Please try again in a few minutes.",
    verification:
      "Complete the security verification before sending your message.",
    unavailable:
      "The form is not configured yet. You can use WhatsApp or LinkedIn.",
    privacy:
      "Your email will only be used to reply to this message.",
  },
} satisfies Record<
  Locale,
  {
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    verification: string;
    unavailable: string;
    privacy: string;
  }
>;

export function ContactForm({ lang, siteKey }: ContactFormProps) {
  const labels = formCopy[lang];
  const formRef = useRef<HTMLFormElement>(null);

  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!siteKey) {
      setStatus("error");
      setFeedback(labels.unavailable);
      return;
    }

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const turnstileToken = String(
      formData.get("cf-turnstile-response") ?? "",
    ).trim();

    if (!turnstileToken) {
      setStatus("error");
      setFeedback(labels.verification);
      return;
    }

    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          message,
          website,
          turnstileToken,
          lang,
          sourcePath: window.location.pathname,
        }),
      });

      const result = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        throw new Error(result.message || labels.error);
      }

      formRef.current?.reset();
      window.turnstile?.reset();

      setStatus("success");
      setFeedback(result.message || labels.success);
    } catch (error) {
      window.turnstile?.reset();

      setStatus("error");
      setFeedback(error instanceof Error ? error.message : labels.error);
    }
  };

  const statusClass =
    status === "success"
      ? "text-emerald-300"
      : status === "error"
        ? "text-rose-300"
        : "text-slate-400";

  return (
    <>
      {siteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8"
        aria-busy={status === "sending"}
      >
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-white"
          >
            {labels.emailLabel}
          </label>

          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder={labels.emailPlaceholder}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="contact-message"
            className="block text-sm font-semibold text-white"
          >
            {labels.messageLabel}
          </label>

          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={6}
            placeholder={labels.messagePlaceholder}
            className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-base leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        <div
          className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {siteKey ? (
          <div className="mt-5 overflow-hidden">
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-theme="dark"
              data-size="flexible"
              data-language={lang}
              data-action="portfolio_contact"
              data-appearance="interaction-only"
              data-refresh-expired="auto"
            />
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-amber-300">
            {labels.unavailable}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending" || !siteKey}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-slate-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? labels.submitting : labels.submit}
        </button>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          {labels.privacy}
        </p>

        <p
          id="contact-form-status"
          className={`mt-4 min-h-6 text-sm font-semibold leading-6 ${statusClass}`}
          aria-live="polite"
        >
          {feedback}
        </p>
      </form>
    </>
  );
}