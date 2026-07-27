import type { Metadata } from "next";
import "@/styles/globals.css";
import { getCleanSiteSettings } from "@/data/site-settings";
import { pageMetadata } from "@/config/seo";
import { SITE_URL } from "@/config/site";
import { fontVariables } from "@/config/fonts";
import { SiteLayout } from "@/page-modules/site-layout";
import { getDynamicFetchOptions } from "@/sanity/lib/live";

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
  const [siteSettings, fetchOptions] = await Promise.all([
    getCleanSiteSettings(),
    getDynamicFetchOptions(),
  ]);

  return (
    <html lang="en" className={fontVariables}>
      <body>
        <SiteLayout
          siteSettings={siteSettings}
          isDraftMode={fetchOptions.stega}
        >
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}
