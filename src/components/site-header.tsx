import Image from "next/image";
import Link from "next/link";

import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";

type SiteHeaderProps = {
  lang: Locale;
  content: SiteContent;
};

export function SiteHeader({ lang, content }: SiteHeaderProps) {
  const contactHref = `/${lang}#${lang === "es" ? "contacto" : "contact"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur">
      <div className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-10">
        <Link
          href={`/${lang}`}
          className="group flex min-w-0 items-center gap-3"
          aria-label="Jorge Arce"
        >
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm">
            <Image
              src="/profile/jorge-arce-square.webp"
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>

          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-bold text-slate-950">
              Jorge Arce
            </span>
            <span className="block truncate text-xs text-slate-500">
              {content.header.role}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Primary navigation"
        >
          {content.navigation.map((item) => (
            <Link
              key={item.href}
              href={`/${lang}${item.href}`}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher currentLocale={lang} />

          <Link
            href={contactHref}
            className="hidden h-10 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 lg:inline-flex"
          >
            {content.header.contact}
          </Link>

          <MobileMenu lang={lang} content={content} />
        </div>
      </div>
    </header>
  );
}
