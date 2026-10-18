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

  return (
    <>
      <SiteHeader lang={lang} content={siteContent[lang]} variant="world" />
      <main>
        <WorldExperience lang={lang} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
      </main>
    </>
  );
}
