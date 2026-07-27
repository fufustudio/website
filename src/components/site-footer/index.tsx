import Link, { type LinkProps } from "next/link";
import { cacheLife } from "next/cache";
import { analyticsConfig } from "@/analytics/config";
import type { NavItem } from "@/components/types";
import { AnalyticsPreferencesButton } from "@/components/analytics-preferences-button";
import { Container } from "@/components/container";
import type { SiteSettings } from "@/data/site-settings";
import { FOOTER_NAV } from "@/components/navigation";
import styles from "./styles.module.css";

export async function SiteFooter({
  siteSettings,
  footerNavItems = FOOTER_NAV,
}: {
  siteSettings?: SiteSettings | null;
  footerNavItems?: readonly NavItem[];
}) {
  const currentYear = await getCurrentYear();
  const showAnalyticsPreferences =
    analyticsConfig.ga4.enabled && analyticsConfig.ga4.consentMode === "basic";

  return (
    <footer className={styles.root}>
      <Container size="xl" className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" className={styles.wordmark}>
            {siteSettings?.name ?? "Fufu Studio"}
          </Link>
          {siteSettings?.tagline ? (
            <p className={styles.tagline}>{siteSettings.tagline}</p>
          ) : null}
        </div>

        {footerNavItems.length > 0 || showAnalyticsPreferences ? (
          <nav aria-label="Footer navigation" className={styles.links}>
            {footerNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href as LinkProps<string>["href"]}
                className={styles.link}
              >
                {item.label}
              </Link>
            ))}
            {showAnalyticsPreferences ? (
              <AnalyticsPreferencesButton className={styles.link} />
            ) : null}
          </nav>
        ) : null}

        <div className={styles.info}>
          © {currentYear} {siteSettings?.name ?? "Fufu Studio"}
        </div>
      </Container>
    </footer>
  );
}

async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
