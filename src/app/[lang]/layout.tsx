import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { siteContent } from "@/content/site-content";
import { isLocale, locales } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const content = siteContent[lang];
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/${lang}`;

  return {
    metadataBase: new URL(siteUrl),
    applicationName: "Jorge Arce Portfolio",
    title: {
      default: content.metadata.title,
      template: `%s | Jorge Arce`,
    },
    description: content.metadata.description,
    authors: [{ name: "Jorge Arce Solano" }],
    creator: "Jorge Arce Solano",
    publisher: "Jorge Arce Solano",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: "/es",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: lang === "es" ? "es_CR" : "en_US",
      url: canonicalUrl,
      siteName: "Jorge Arce Solano",
      title: content.metadata.title,
      description: content.metadata.description,
      images: [
        {
          url: "/og/portfolio-og.png",
          width: 1200,
          height: 630,
          alt: "Jorge Arce Solano — Full Stack Software Engineer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metadata.title,
      description: content.metadata.description,
      images: ["/og/portfolio-og.png"],
    },
    icons: {
      icon: [
        { url: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/icons/icon-192.png",
    },
    manifest: "/manifest.webmanifest",
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}