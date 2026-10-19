import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { CompactPortfolio } from "@/components/portfolio/compact-portfolio";
import { ContactStudio } from "@/components/portfolio/contact-studio";
import { siteContent } from "@/content/site-content";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return {
    title: lang === "es" ? "Proyectos, método y contacto | JarceDev" : "Projects, approach and contact | JarceDev",
    description: siteContent[lang].projectsSection.description,
    openGraph: {
      type: "website",
      url: "/" + lang + "/portfolio",
      title: lang === "es" ? "Proyectos y método de trabajo | JarceDev" : "Projects and process | JarceDev",
      description: siteContent[lang].projectsSection.description,
      images: [{ url: "/" + lang + "/opengraph-image", width: 1200, height: 630,
        alt: lang === "es" ? "Cuatro proyectos de JarceDev" : "Four JarceDev projects" }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/" + lang + "/opengraph-image"],
    },
    alternates: {
      canonical: "/" + lang + "/portfolio",
      languages: { es: "/es/portfolio", en: "/en/portfolio" },
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const content = siteContent[lang];
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
    (process.env.NODE_ENV === "development" ? "1x00000000000000000000AA" : "");

  return (
    <>
      <SiteHeader lang={lang} content={content} />
      <main>
        <CompactPortfolio lang={lang} />
        <ContactStudio lang={lang} siteKey={siteKey} />
      </main>
      <footer className="bg-[#081222] px-4 py-7 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} JarceDev · {content.footer.rights}
        <Link href={"/" + lang} className="ml-3 font-semibold text-violet-300 hover:text-white">
          {lang === "es" ? "Volver al mundo 3D" : "Back to the 3D world"} ↗
        </Link>
      </footer>
    </>
  );
}
