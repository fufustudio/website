import type { Metadata } from "next";
import { Suspense } from "react";
import { getPrivacyContent } from "@/content/privacy";
import { site } from "@/content/site";
import { getCleanSiteSettings } from "@/data/site-settings";
import { pageMetadata } from "@/config/seo";
import PrivacyPage from "./components/privacy-page";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getCleanSiteSettings();

  return pageMetadata({
    siteSettings,
    title: "Privacy Policy",
    description:
      "Privacy information for this website's contact form, analytics, providers, and visitor data practices.",
    path: "/privacy",
  });
}

export default function Privacy() {
  return (
    <Suspense
      fallback={<PrivacyPage privacyContent={getPrivacyContent(site)} />}
    >
      <DynamicPrivacy />
    </Suspense>
  );
}

async function DynamicPrivacy() {
  const siteSettings = await getCleanSiteSettings();
  const privacyContent = getPrivacyContent(siteSettings);

  return <PrivacyPage privacyContent={privacyContent} />;
}
