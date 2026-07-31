"use client";

import Link from "next/link";
import { useState } from "react";

import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type MobileMenuProps = {
  lang: Locale;
  content: SiteContent;
};

export function MobileMenu({ lang, content }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = "mobile-navigation";
  const contactHref = `/${lang}#${lang === "es" ? "contacto" : "contact"}`;

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition hover:border-slate-950"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={
          isOpen
            ? lang === "es"
              ? "Cerrar navegación"
              : "Close navigation"
            : lang === "es"
              ? "Abrir navegación"
              : "Open navigation"
        }
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="sr-only">{isOpen ? "Close" : "Menu"}</span>
        <span className="relative block h-4 w-5" aria-hidden="true">
          <span
            className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${
              isOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${
              isOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {isOpen ? (
        <div
          id={menuId}
          className="absolute right-0 top-14 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15"
        >
          <nav aria-label="Mobile navigation">
            {content.navigation.map((item) => (
              <Link
                key={item.href}
                href={`/${lang}${item.href}`}
                className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-2 border-t border-slate-200 pt-2">
            <Link
              href={contactHref}
              className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
              onClick={() => setIsOpen(false)}
            >
              {content.header.contact}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
