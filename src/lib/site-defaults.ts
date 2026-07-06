import { publicEnv } from "@/lib/env";
import type { NavItem } from "@/components/types";

export const SITE_URL = publicEnv.siteUrl;

export const SITE_NAME = "Fufu Studio";

export const SITE_DEFAULT_DESCRIPTION =
  "Building bespoke sites and software for businesses who care how they show up online.";

export const MAIN_NAV = [] as const satisfies readonly NavItem[];

export const FOOTER_NAV = [] as const satisfies readonly NavItem[];
