import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return [
    ...(["es", "en"] as const).map((lang) => ({
      url: `${siteUrl}/${lang}/projects/hidrantes-app`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
      alternates: {
        languages: {
          es: `${siteUrl}/es/projects/hidrantes-app`,
          en: `${siteUrl}/en/projects/hidrantes-app`,
        },
      },
    })),
    {
      url: `${siteUrl}/es/portfolio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: {
          es: `${siteUrl}/es/portfolio`,
          en: `${siteUrl}/en/portfolio`,
        },
      },
    },
    {
      url: `${siteUrl}/en/portfolio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: {
          es: `${siteUrl}/es/portfolio`,
          en: `${siteUrl}/en/portfolio`,
        },
      },
    },
    {
      url: `${siteUrl}/es`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          es: `${siteUrl}/es`,
          en: `${siteUrl}/en`,
        },
      },
    },
    {
      url: `${siteUrl}/en`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          es: `${siteUrl}/es`,
          en: `${siteUrl}/en`,
        },
      },
    },
    {
      url: `${siteUrl}/es/projects/firetrack`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/en/projects/firetrack`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/es/projects/acreditaciones-app`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: {
        languages: {
          es: `${siteUrl}/es/projects/acreditaciones-app`,
          en: `${siteUrl}/en/projects/acreditaciones-app`,
        },
      },
    },
    {
      url: `${siteUrl}/en/projects/acreditaciones-app`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: {
        languages: {
          es: `${siteUrl}/es/projects/acreditaciones-app`,
          en: `${siteUrl}/en/projects/acreditaciones-app`,
        },
      },
    },
    {
      url: `${siteUrl}/es/projects/evacuaplan-studio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/en/projects/evacuaplan-studio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
