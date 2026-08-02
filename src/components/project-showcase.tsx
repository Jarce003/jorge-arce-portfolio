"use client";

import Image from "next/image";
import { useState } from "react";

import { FireTrackDemo } from "@/components/project-demo/firetrack-demo";
import type { ProjectGalleryItem } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

type ProjectSlug =
  | "firetrack"
  | "evacuaplan-studio";

type ProjectShowcaseProps = {
  items: ProjectGalleryItem[];
  project?: ProjectSlug;
  lang?: Locale;
  priority?: boolean;
  compact?: boolean;
};

export function ProjectShowcase({
  items,
  project,
  lang,
  priority = false,
  compact = false,
}: ProjectShowcaseProps) {
  const isFireTrackDemo =
    project === "firetrack";

  const resolvedLang =
    lang ?? "es";

  const [activeId, setActiveId] =
    useState(items[0]?.id ?? "");

  const activeItem =
    items.find(
      (item) =>
        item.id === activeId,
    ) ?? items[0];

  const demoCopy =
    resolvedLang === "es"
      ? {
          title:
            "Explore FireTrack directamente",
          description:
            "Una demo interactiva con panel, inventario, fichas, QR, croquis y actividad.",
        }
      : {
          title:
            "Explore FireTrack directly",
          description:
            "An interactive demo with dashboard, inventory, records, QR, floor plan and activity.",
        };

  if (isFireTrackDemo) {
    return (
      <div className="overflow-hidden rounded-[1.4rem] border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950/20 sm:rounded-[1.7rem]">
        <FireTrackDemo
          lang={resolvedLang}
        />

        <div className="border-t border-slate-800 px-4 py-4 sm:px-5">
          <p className="text-sm font-bold text-white">
            {demoCopy.title}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {demoCopy.description}
          </p>
        </div>
      </div>
    );
  }

  if (!activeItem) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950/20 sm:rounded-[1.7rem]">
      <div className="flex gap-1 overflow-x-auto border-b border-slate-800 p-2.5 sm:p-3">
        {items.map((item) => {
          const isActive =
            item.id === activeItem.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`min-h-11 shrink-0 rounded-xl px-4 text-xs font-bold transition sm:text-sm ${
                isActive
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              aria-pressed={isActive}
              onClick={() => {
                setActiveId(item.id);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        className={`relative bg-slate-950 ${
          compact
            ? "aspect-[1.34/1] sm:aspect-[1.62/1]"
            : "aspect-[1.34/1] sm:aspect-[1.75/1]"
        }`}
      >
        <Image
          key={activeItem.src}
          src={activeItem.src}
          alt={activeItem.alt}
          fill
          priority={priority}
          sizes={
            compact
              ? "(max-width: 1024px) 100vw, 46vw"
              : "(max-width: 1024px) 100vw, 50vw"
          }
          className="object-contain"
        />
      </div>

      <div className="border-t border-slate-800 px-4 py-4 sm:px-5">
        <p className="text-sm font-bold text-white">
          {activeItem.title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {activeItem.description}
        </p>
      </div>
    </div>
  );
}