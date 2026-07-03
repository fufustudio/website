import { publicEnv } from "@/lib/env";
import type { NavItem } from "@/components/types";

export const SITE_URL = publicEnv.siteUrl;

export const SITE_NAME = "Fufu";

export const SITE_DEFAULT_DESCRIPTION = "Hello world, powered by Sanity.";

export const MAIN_NAV = [] as const satisfies readonly NavItem[];

export const FOOTER_NAV = [] as const satisfies readonly NavItem[];
