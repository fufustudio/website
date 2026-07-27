import type { Metadata } from "next";
import { Suspense } from "react";
import { getCleanSiteSettings } from "@/data/site-settings";
import { getHomePageContent } from "@/data/home-page";
import type { HomePageContent } from "@/data/home-page";
import { pageMetadata } from "@/config/seo";
import { home } from "@/content/home";
import { getDynamicFetchOptions } from "@/sanity/lib/live";
import { HomePage } from "@/page-modules/home";

const fallbackContent: HomePageContent = {
  title: home.heading,
  intro: home.intro,
};

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getCleanSiteSettings();

  return pageMetadata({ siteSettings, path: "/" });
}

export default function Page() {
  return (
    <Suspense fallback={<HomePage content={fallbackContent} />}>
      <DynamicHomePage />
    </Suspense>
  );
}

async function DynamicHomePage() {
  const content = await getHomePageContent(await getDynamicFetchOptions());

  return <HomePage content={content} />;
}
