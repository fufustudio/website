import Link from "next/link";
import type { NavItem } from "@/components/types";
import { Container } from "@/components/container";
import type { SiteSettings } from "@/data/site-settings";
import { MAIN_NAV } from "@/components/navigation";
import { HeaderNav } from "@/components/site-header-nav";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

export function SiteHeader({
  siteSettings,
  navItems = MAIN_NAV,
}: {
  siteSettings?: SiteSettings | null;
  navItems?: readonly NavItem[];
}) {
  const hasNavItems = navItems.length > 0;

  return (
    <header className={cn(styles.root, styles.solidOverlay)}>
      <Container size="xl" className={styles.inner}>
        <Link href="/" className={styles.wordmark}>
          {siteSettings?.name ?? "Fufu Studio"}
        </Link>

        {hasNavItems ? <HeaderNav navItems={navItems} /> : null}
      </Container>
    </header>
  );
}
