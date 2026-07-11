import type { Metadata } from "next";
import type { Organization, WithContext } from "schema-dts";
import type { SiteSettings } from "@/data/site-settings";

export function pageMetadata({
  siteSettings,
  title,
  description = siteSettings.tagline,
  path,
}: {
  siteSettings: SiteSettings;
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const fullTitle = title
    ? `${title} | ${siteSettings.name}`
    : siteSettings.name;

  return {
    title: fullTitle,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      ...(path ? { url: path } : {}),
      siteName: siteSettings.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function organizationJsonLd(
  settings: SiteSettings,
): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name,
    email: settings.email,
    telephone: settings.phone,
    url: settings.url,
    address: organizationAddress(settings),
    sameAs: settings.sameAs,
  };
}

function organizationAddress(settings: SiteSettings) {
  const address = settings.address;
  if (!address) return undefined;

  const hasAddressFields = [
    address.line1,
    address.city,
    address.region,
    address.postalCode,
  ].some((field) => field?.trim());

  if (!hasAddressFields) return undefined;

  return {
    "@type": "PostalAddress" as const,
    streetAddress: address.line1 || undefined,
    addressLocality: address.city || undefined,
    addressRegion: address.region || undefined,
    postalCode: address.postalCode || undefined,
    addressCountry: address.country || undefined,
  };
}
