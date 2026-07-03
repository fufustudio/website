import { defineQuery, type QueryParams } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";

import { client, isSanityConfigured } from "@/sanity/lib/client";
import { site } from "@/content/site";

export type RichText = PortableTextBlock[];

export type FeatureIcon = "circle" | "leaves" | "bud" | "quatrefoil";

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
  url?: string;
  tagline?: string;
  areaServed?: readonly string[];
  sameAs?: readonly string[];
};

export type FeatureContent = {
  _key?: string;
  title: string;
  slug: string;
  icon: FeatureIcon;
  summary?: string;
};

export type PageContent = {
  title: string;
  intro?: string;
  features?: FeatureContent[];
  body?: RichText;
};

export type PostMeta = {
  _updatedAt?: string;
  title: string;
  slug: string;
  publishedAt?: string;
  excerpt?: string;
};

const siteSettingsQuery = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    name,
    contactName,
    email,
    phone,
    address,
    hours,
    primaryActionLabel,
    primaryActionUrl,
    url,
    tagline,
    areaServed,
    sameAs
  }
`);

async function fetchCms<T>(query: string, params: QueryParams = {}) {
  if (!isSanityConfigured) return null;

  try {
    const data = await client.fetch<T | null>(query, params, {
      next: { revalidate: 60 },
    });
    return data ?? null;
  } catch (error) {
    console.warn("[sanity] Optional CMS content unavailable:", error);
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await fetchCms<SiteSettings>(siteSettingsQuery);
  return settings ?? site;
}
