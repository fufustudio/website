import "server-only";

import { cache } from "react";
import { site } from "@/content/site";
import {
  requireSanityDocument,
  sanityOrFallback,
} from "@/data/sanity-or-fallback";
import {
  publishedFetchOptions,
  sanityFetch,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/data/queries/site-settings";
import type { SiteSettingsQueryResult } from "@/sanity/types";

export type SiteSettings = {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    note?: string;
  };
  hours?: readonly string[];
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  url: string;
  tagline: string;
  areaServed?: readonly string[];
  sameAs?: readonly string[];
};

async function loadSiteSettings(
  options: DynamicFetchOptions,
): Promise<SiteSettings> {
  return sanityOrFallback(
    () => loadSanitySiteSettings(options),
    () => site,
  );
}

async function loadSanitySiteSettings(
  options: DynamicFetchOptions,
): Promise<SiteSettings> {
  "use cache";

  const { data: settings } = await sanityFetch({
    query: siteSettingsQuery,
    ...options,
  });

  return normalizeSiteSettings(
    requireSanityDocument(settings, '"siteSettings" singleton'),
  );
}

export const getSiteSettings = cache((options: DynamicFetchOptions) =>
  loadSiteSettings(options),
);

export const getCleanSiteSettings = cache(() =>
  loadSiteSettings(publishedFetchOptions),
);

function normalizeSiteSettings(
  settings: NonNullable<SiteSettingsQueryResult>,
): SiteSettings {
  return {
    ...site,
    name: settings.name?.trim() || site.name,
    contactName: settings.contactName ?? undefined,
    email: settings.email ?? undefined,
    phone: settings.phone ?? undefined,
    address: settings.address
      ? {
          line1: settings.address.line1,
          city: settings.address.city,
          region: settings.address.region,
          postalCode: settings.address.postalCode,
          country: settings.address.country,
          note: settings.address.note,
        }
      : undefined,
    hours: settings.hours ?? undefined,
    primaryActionLabel: settings.primaryActionLabel ?? undefined,
    primaryActionUrl: settings.primaryActionUrl ?? undefined,
    url: site.url,
    tagline: settings.tagline?.trim() || site.tagline,
    areaServed: settings.areaServed ?? undefined,
    sameAs: settings.sameAs ?? undefined,
  };
}
