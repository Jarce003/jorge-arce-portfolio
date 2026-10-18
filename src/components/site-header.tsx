import Image from "next/image";
import Link from "next/link";

import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";

type SiteHeaderProps = {
  lang: Locale;
  content: SiteContent;
  variant?: "default" | "world";
};

export function SiteHeader({ lang, content, variant = "default" }: SiteHeaderProps) {
  const world = variant === "world";
  const contactHref = `/${lang}#${lang === "es" ? "contacto" : "contact"}`;

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${world ? "border-white/10 bg-[#081525]/95 text-white" : "border-slate-200/80 bg-slate-50/90"}`}>
      <div className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-10">
        <Link
          href={`/${lang}`}
          className="group flex min-w-0 items-center gap-3"
          aria-label="Jorge Arce"
        >
          <span className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border shadow-sm ${world ? "border-violet-400/50 bg-slate-900" : "border-slate-200 bg-slate-200"}`}>
            <Image
              src="/profile/jorge-arce-square.webp"
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>

          <span className="hidden min-w-0 sm:block">
            <span className={`block truncate text-sm font-bold ${world ? "text-white" : "text-slate-950"}`}>
              Jorge Arce
            </span>
            <span className={`block truncate text-xs ${world ? "text-slate-300" : "text-slate-500"}`}>
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
              className={`text-sm font-medium transition ${world ? "text-slate-200 hover:text-violet-200" : "text-slate-600 hover:text-slate-950"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher currentLocale={lang} variant={variant} />

          <Link
            href={contactHref}
            className={`hidden h-10 items-center rounded-full px-5 text-sm font-semibold transition lg:inline-flex ${world ? "bg-violet-300 text-slate-950 hover:bg-violet-200" : "bg-slate-950 text-white hover:bg-slate-800"}`}
          >
            {content.header.contact}
          </Link>

          <MobileMenu lang={lang} content={content} variant={variant} />
        </div>
      </div>
    </header>
  );
}
