import { GoogleAnalytics } from "@/components/scripts/google-analytics";
import { OrganizationJsonLd } from "@/components/scripts/organization-json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getSiteSettings } from "@/lib/cms";
import { publicEnv } from "@/lib/env";
import styles from "./styles.module.css";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();

  return (
    <div className={styles.shell}>
      <GoogleAnalytics measurementId={publicEnv.googleAnalyticsId} />
      <OrganizationJsonLd siteSettings={siteSettings} />
      <Header siteSettings={siteSettings} />
      <main className={styles.main}>{children}</main>
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
