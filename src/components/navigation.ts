import type { NavItem } from "@/components/types";

export const MAIN_NAV = [
  { label: "Privacy", href: "/privacy" },
] as const satisfies readonly NavItem[];

export const FOOTER_NAV = [
  { label: "Privacy", href: "/privacy" },
] as const satisfies readonly NavItem[];
