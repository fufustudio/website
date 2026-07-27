import { VisualEditing } from "next-sanity/visual-editing";
import { DraftModeControls } from "@/components/draft-mode-controls";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteScripts } from "@/components/site-scripts";
import { organizationJsonLd } from "@/config/seo";
import type { SiteSettings } from "@/data/site-settings";
import { isSanityConfigured } from "@/sanity/lib/client";
import { SanityLive } from "@/sanity/lib/live";
import styles from "./styles.module.css";

export function SiteLayout({
  children,
  isDraftMode,
  siteSettings,
}: {
  children: React.ReactNode;
  isDraftMode: boolean;
  siteSettings: SiteSettings;
}) {
  return (
    <>
      <div className={styles.shell}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(siteSettings)).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader siteSettings={siteSettings} />
        <main id="main-content" tabIndex={-1} className={styles.main}>
          {children}
        </main>
        <SiteFooter siteSettings={siteSettings} />
        <SiteScripts />
      </div>
      {isSanityConfigured ? <SanityLive includeDrafts={isDraftMode} /> : null}
      {isDraftMode ? (
        <>
          <VisualEditing />
          <DraftModeControls />
        </>
      ) : null}
    </>
  );
}
