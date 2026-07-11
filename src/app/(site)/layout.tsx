import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualEditing } from "next-sanity/visual-editing";
import "./globals.css";
import { DraftModeControls } from "@/components/layout/draft-mode-controls";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteScripts } from "@/components/layout/site-scripts";
import { getCleanSiteSettings } from "@/data/site-settings";
import { organizationJsonLd, pageMetadata } from "@/config/seo";
import { SITE_URL } from "@/config/site";
import { fontVariables } from "@/config/fonts";
import { isSanityConfigured } from "@/sanity/lib/client";
import { getDynamicFetchOptions, SanityLive } from "@/sanity/lib/live";
import styles from "./layout.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const [siteSettings, fetchOptions] = await Promise.all([
    getCleanSiteSettings(),
    getDynamicFetchOptions(),
  ]);

  return {
    metadataBase: new URL(SITE_URL),
    ...pageMetadata({ siteSettings }),
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
    robots: fetchOptions.stega
      ? { index: false, follow: false, nocache: true }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getCleanSiteSettings();

  return (
    <html lang="en" className={fontVariables}>
      <body>
        <SiteShell
          siteSettings={siteSettings}
          structuredDataSettings={siteSettings}
        >
          {children}
        </SiteShell>
        <Suspense fallback={null}>
          <SanityRuntime />
        </Suspense>
      </body>
    </html>
  );
}

async function SanityRuntime() {
  const fetchOptions = await getDynamicFetchOptions();
  const isDraftMode = fetchOptions.stega;

  return (
    <>
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

function SiteShell({
  children,
  siteSettings,
  structuredDataSettings,
}: {
  children: React.ReactNode;
  siteSettings: Awaited<ReturnType<typeof getCleanSiteSettings>>;
  structuredDataSettings: Awaited<ReturnType<typeof getCleanSiteSettings>>;
}) {
  return (
    <div className={styles.shell}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            organizationJsonLd(structuredDataSettings),
          ).replace(/</g, "\\u003c"),
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
  );
}
