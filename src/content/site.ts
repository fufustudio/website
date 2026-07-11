import { SITE_URL } from "@/config/site";
import type { SiteSettings } from "@/data/site-settings";

export const site = {
  name: "Fufu Studio",
  contactName: "Fufu Studio",
  email: "hello@fufu.studio",
  hours: [],
  primaryActionLabel: "Start a project",
  primaryActionUrl: "/#message",
  url: SITE_URL,
  tagline: "Design and development studio.",
  areaServed: [],
  sameAs: [],
} satisfies SiteSettings;
