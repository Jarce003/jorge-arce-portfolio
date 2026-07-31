"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  currentLocale: Locale;
};

export function LanguageSwitcher({
  currentLocale,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const targetLocale: Locale = currentLocale === "es" ? "en" : "es";

  const targetPath =
    pathname?.replace(
      /^\/(es|en)(?=\/|$)/,
      `/${targetLocale}`,
    ) ?? `/${targetLocale}`;

  return (
    <Link
      href={targetPath}
      className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold tracking-[0.12em] text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
      aria-label={
        targetLocale === "es"
          ? "Cambiar el idioma a español"
          : "Switch language to English"
      }
    >
      {targetLocale.toUpperCase()}
    </Link>
  );
}