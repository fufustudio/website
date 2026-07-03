import { SITE_URL } from "@/lib/site-defaults";
import type { SiteSettings } from "@/lib/cms";

export const site = {
  name: "Fufu",
  contactName: "Fufu",
  email: "hello@fufu.studio",
  hours: [],
  primaryActionLabel: "Send email",
  primaryActionUrl: "/",
  url: SITE_URL,
  tagline: "Hello world, powered by Sanity.",
  areaServed: [],
  sameAs: [],
} satisfies SiteSettings;
