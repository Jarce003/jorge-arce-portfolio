"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import type { SiteContent } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type MobileMenuProps = {
  lang: Locale;
  content: SiteContent;
};

export function MobileMenu({
  lang,
  content,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const triggerRef =
    useRef<HTMLButtonElement>(null);

  const menuId = "mobile-navigation";
  const homePath = `/${lang}`;

  const contactHash =
    lang === "es" ? "#contacto" : "#contact";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsOpen(false);

      window.setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const closeMenuAndRestoreFocus = () => {
    closeMenu();

    window.setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  };

  const menuPortal =
    isMounted && isOpen
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-x-0 bottom-0 top-[4.5rem] z-[90] cursor-default bg-slate-950/10 sm:top-20"
              aria-label={
                lang === "es"
                  ? "Cerrar menú"
                  : "Close menu"
              }
              onClick={closeMenuAndRestoreFocus}
            />

            <div
              id={menuId}
              className="pointer-events-auto fixed right-4 top-[4.75rem] z-[100] w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/20 sm:right-8 sm:top-[5.25rem]"
            >
              <nav
                aria-label={
                  lang === "es"
                    ? "Navegación móvil"
                    : "Mobile navigation"
                }
              >
                {content.navigation.map((item) => (
                  <a
                    key={item.href}
                    href={`${homePath}${item.href}`}
                    className="flex min-h-12 items-center rounded-xl px-4 text-base font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-2 border-t border-slate-200 pt-2">
                <a
                  href={`${homePath}${contactHash}`}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-4 text-base font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
                  onClick={closeMenu}
                >
                  {content.header.contact}
                </a>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="relative lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition hover:border-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
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
        onClick={() => {
          setIsOpen((current) => !current);
        }}
      >
        <span className="sr-only">
          {isOpen ? "Close" : "Menu"}
        </span>

        <span
          className="relative block h-4 w-5"
          aria-hidden="true"
        >
          <span
            className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${
              isOpen
                ? "translate-y-[7px] rotate-45"
                : ""
            }`}
          />

          <span
            className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${
              isOpen ? "opacity-0" : ""
            }`}
          />

          <span
            className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${
              isOpen
                ? "-translate-y-[7px] -rotate-45"
                : ""
            }`}
          />
        </span>
      </button>

      {menuPortal}
    </div>
  );
}