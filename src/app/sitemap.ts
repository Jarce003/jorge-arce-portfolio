import type { MetadataRoute } from "next";

import { projectDefinitions } from "@/content/projects";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const langs = ["es", "en"] as const;
  const common: MetadataRoute.Sitemap = langs.flatMap((lang) => [
    {
      url: siteUrl + "/" + lang,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1,
      alternates: { languages: { es: siteUrl + "/es", en: siteUrl + "/en" } },
    },
    {
      url: siteUrl + "/" + lang + "/portfolio",
      lastModified,
      changeFrequency: "monthly" as const,
      priority: .9,
      alternates: {
        languages: {
          es: siteUrl + "/es/portfolio",
          en: siteUrl + "/en/portfolio",
        },
      },
    },
  ]);
  const projects: MetadataRoute.Sitemap = langs.flatMap((lang) =>
    projectDefinitions.map((project) => ({
      url: siteUrl + "/" + lang + "/projects/" + project.slug,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: .8,
      alternates: {
        languages: {
          es: siteUrl + "/es/projects/" + project.slug,
          en: siteUrl + "/en/projects/" + project.slug,
        },
      },
    })),
  );
  return [...common, ...projects];
}
