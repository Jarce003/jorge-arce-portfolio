"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  variant?: "default" | "world";
};

export function LanguageSwitcher({
  currentLocale,
  variant = "default",
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
      className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold tracking-[0.12em] transition ${variant === "world" ? "border-white/25 bg-white/10 text-white hover:border-violet-300 hover:bg-white/20" : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-950"}`}
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