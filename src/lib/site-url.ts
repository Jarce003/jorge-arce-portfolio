const fallbackSiteUrl = "https://jarcedev.com";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = configuredUrl || fallbackSiteUrl;

  return siteUrl.replace(/\/$/, "");
}
