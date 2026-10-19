import { notFound } from "next/navigation";

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

  // Both locales run the SAME R3F build, with language selected via URL.
  // This keeps physics, graphics and rescue rewards identical in ES and EN.
  return (
    <main className="fixed inset-0 h-[100dvh] min-h-0 w-full overflow-hidden bg-[#081326]">
      <h1 className="sr-only">
        {lang === "es" ? "JarceDev — Portafolio 3D de Jorge Arce" : "JarceDev — Jorge Arce's 3D Portfolio"}
      </h1>
      <iframe
        title={lang === "es" ? "Portafolio 3D de JarceDev" : "JarceDev 3D Portfolio"}
        src={`/experience/index.html?lang=${lang}`}
        className="block h-full w-full border-0"
        loading="eager"
        allowFullScreen
      />
      <noscript>
        <p>
          {lang === "es" ? "Consulta mis proyectos en " : "View my projects at "}
          <a href={`/${lang}/portfolio`}>
            {lang === "es" ? "el portafolio" : "my portfolio"}
          </a>.
        </p>
      </noscript>
    </main>
  );
}
