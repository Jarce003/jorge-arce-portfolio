const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = configuredUrl || fallbackSiteUrl;

  return siteUrl.replace(/\/$/, "");
}
