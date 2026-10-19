"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProjectView } from "@/content/projects";

type Props = {
  project: ProjectView;
  sizes: string;
  decorative?: boolean;
  priority?: boolean;
  className?: string;
};

/**
 * Consistent 16:9 artwork used by both the 3D world and the HTML project
 * surfaces. Local SVGs bypass image optimization. If loading still fails,
 * the visitor sees an accessible branded fallback instead of an empty card.
 */
export function ProjectArtwork({
  project,
  sizes,
  decorative = false,
  priority = false,
  className = "",
}: Props) {
  const [loadFailed, setLoadFailed] = useState(false);

  return (
    <div className={"absolute inset-0 overflow-hidden " + className}>
      {loadFailed ? (
        <div role={decorative ? "presentation" : "img"}
          aria-label={decorative ? undefined : project.previewAlt}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#13243a] px-2 text-center"
          style={{ borderColor: project.accent }}>
          <span aria-hidden="true" className="text-3xl sm:text-4xl">{project.icon}</span>
          <span className="text-[.73rem] font-semibold text-white sm:text-sm">{project.title}</span>
          <span className="text-[.61rem] text-slate-300">{project.category}</span>
        </div>
      ) : (
        <Image
          src={project.preview}
          alt={decorative ? "" : project.previewAlt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          onError={() => setLoadFailed(true)}
          className="object-contain p-1.5 sm:p-3"
          data-testid={"preview-" + project.slug}
        />
      )}
    </div>
  );
}
