import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { WorldExperience } from "@/components/world/world-experience";
import { siteContent } from "@/content/site-content";
import { isLocale } from "@/lib/i18n";

type HomePageProps = {
  params: Promise<{ lang: string }>;
};

/**
 * JarceDev is an explorable world first. All longer information lives in
 * /[lang]/portfolio and in the project case studies—not below the canvas.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // The finished Spanish experience is hosted by Next.js itself, sharing the
  // four authoritative project pages and existing static GLB assets.
  // Keep the established English world untouched until its translation ships.
  if (lang === "es") {
    return (
      <main className="relative h-[100svh] w-full overflow-hidden bg-[#081326]">
        <h1 className="sr-only">JarceDev — Portafolio interactivo de ingeniería de software</h1>
        <iframe
          title="Explora el portafolio 3D de JarceDev"
          src="/experience/index.html"
          className="block h-full w-full border-0"
          loading="eager"
          allowFullScreen
        />
        <noscript>
          <p>
            El mundo 3D requiere JavaScript. Consulta los cuatro proyectos
            en <a href="/es/portfolio">el portafolio accesible</a>.
          </p>
        </noscript>
      </main>
    );
  }

  return (
    <>
      <SiteHeader lang={lang} content={siteContent[lang]} variant="world" />
      <main>
        <WorldExperience lang={lang} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
      </main>
    </>
  );
}
