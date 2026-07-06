import { defineQuery, type QueryParams } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";

import { client, isSanityConfigured } from "@/sanity/lib/client";
import { homePageContent } from "@/content/home";
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

export type ServiceContent = {
  _key?: string;
  num: string;
  title: string;
  slug?: string;
  summary: string;
  capabilities: readonly string[];
};

export type HomePageContent = {
  title: string;
  description: string;
  heroCta: {
    label: string;
    href: string;
  };
  ethos: {
    eyebrow: string;
    heading: string;
    items: readonly {
      tag: string;
      body: string;
    }[];
  };
  services: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: readonly ServiceContent[];
  };
  about: {
    eyebrow: string;
    heading: string;
    intro: string;
    people: readonly {
      role: string;
      name: string;
      href: string;
      placeholder: string;
      bio: string;
    }[];
  };
  contact: {
    heading: string;
    intro: string;
    email: string;
  };
};

export type PageContent = {
  title: string;
  description?: string;
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

const homePageQuery = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == "home"][0]{
    title,
    description,
    body
  }
`);

const servicesQuery = defineQuery(/* groq */ `
  *[_type == "service" && active != false] | order(order asc, title asc) {
    _key,
    title,
    "slug": slug.current,
    summary,
    capabilities,
    order
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

export async function getHomePage(): Promise<HomePageContent> {
  const page = await fetchCms<PageContent>(homePageQuery);
  const services = await fetchCms<
    Array<{
      _key?: string;
      title: string;
      slug?: string;
      summary?: string;
      capabilities?: string[];
      order?: number;
    }>
  >(servicesQuery);

  return {
    ...homePageContent,
    title: page?.title ?? homePageContent.title,
    description: page?.description ?? homePageContent.description,
    services: {
      ...homePageContent.services,
      items:
        services && services.length > 0
          ? services.map((service, index) => ({
              _key: service._key,
              num: String(index + 1).padStart(2, "0"),
              title: service.title,
              slug: service.slug,
              summary: service.summary ?? "",
              capabilities: service.capabilities ?? [],
            }))
          : homePageContent.services.items,
    },
  };
}
