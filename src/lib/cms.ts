import { defineQuery, type QueryParams } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";

import { client, isSanityConfigured } from "@/sanity/lib/client";
import { homePageContent } from "@/content/home";
import {
  imageBlurData,
  imageObjectPosition,
  imageSrc,
  type SanityImageValue,
} from "@/lib/cms-images";
import { site } from "@/content/site";
import type { ResponsiveImageContent } from "@/lib/responsive-image";

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
      _key?: string;
      role: string;
      name: string;
      href: string;
      placeholder: string;
      portrait?: ResponsiveImageContent;
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
  about?: {
    eyebrow?: string;
    heading?: string;
    intro?: string;
    people?: CmsTeamMember[];
  };
  body?: RichText;
};

type CmsTeamMember = {
  _key?: string;
  role?: string;
  name?: string;
  href?: string;
  portrait?: SanityImageValue;
  bio?: string;
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
    about{
      eyebrow,
      heading,
      intro,
      people[]{
        _key,
        role,
        name,
        href,
        bio,
        portrait{
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions { width, height }
            }
          },
          alt,
          hotspot,
          crop
        }
      }
    },
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
    about: mapAboutSection(page?.about),
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

const teamPortraitSizes =
  "(min-width: 1200px) 528px, (min-width: 640px) calc(50vw - 3.5rem), calc(100vw - 3rem)";

function mapAboutSection(
  about: PageContent["about"],
): HomePageContent["about"] {
  if (!about) return homePageContent.about;

  const people =
    about.people && about.people.length > 0
      ? about.people.map((person, index) => {
          const fallback = homePageContent.about.people[index];
          const role = person.role ?? fallback?.role ?? "";

          return {
            _key: person._key,
            role,
            name: person.name ?? fallback?.name ?? "",
            href: person.href ?? fallback?.href ?? "",
            placeholder: fallback?.placeholder ?? `${role || "Team"} portrait`,
            portrait: mapSanityPortrait(person.portrait) ?? fallback?.portrait,
            bio: person.bio ?? fallback?.bio ?? "",
          };
        })
      : homePageContent.about.people;

  return {
    eyebrow: about.eyebrow ?? homePageContent.about.eyebrow,
    heading: about.heading ?? homePageContent.about.heading,
    intro: about.intro ?? homePageContent.about.intro,
    people,
  };
}

function mapSanityPortrait(
  portrait: SanityImageValue,
): ResponsiveImageContent | undefined {
  const src = imageSrc(portrait);
  if (!src) return undefined;

  const blurDataURL = imageBlurData(portrait);

  return {
    src,
    alt: portrait?.alt ?? "",
    sizes: teamPortraitSizes,
    quality: 75,
    placeholder: blurDataURL ? "blur" : undefined,
    blurDataURL,
    objectPosition: imageObjectPosition(portrait),
  };
}
