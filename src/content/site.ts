import { SITE_URL } from "@/lib/site-defaults";
import type { SiteSettings } from "@/lib/cms";

export const site = {
  name: "Fufu Studio",
  contactName: "Fufu Studio",
  email: "hello@fufu.studio",
  hours: [],
  primaryActionLabel: "Start a project",
  primaryActionUrl: "/#contact",
  url: SITE_URL,
  tagline:
    "Building bespoke sites and software for businesses who care how they show up online.",
  areaServed: [],
  sameAs: [],
} satisfies SiteSettings;
