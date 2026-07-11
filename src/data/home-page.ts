import "server-only";

import { home } from "@/content/home";
import {
  requireSanityDocument,
  sanityOrFallback,
} from "@/data/sanity-or-fallback";
import { sanityFetch } from "@/sanity/lib/live";
import type { DynamicFetchOptions } from "@/sanity/lib/live";
import { homePageQuery } from "@/data/queries/home-page";
import type { HomePageQueryResult, SimplePortableText } from "@/sanity/types";

export type HomePageContent = {
  title: string;
  intro?: string;
  body?: SimplePortableText;
};

export async function getHomePageContent(
  options: DynamicFetchOptions,
): Promise<HomePageContent> {
  return sanityOrFallback(
    () => loadSanityHomePage(options),
    () => normalizeHomePage(null),
  );
}

async function loadSanityHomePage(
  options: DynamicFetchOptions,
): Promise<HomePageContent> {
  "use cache";

  const { data: content } = await sanityFetch({
    query: homePageQuery,
    ...options,
  });

  return normalizeHomePage(
    requireSanityDocument(content, 'page with slug "home"'),
  );
}

function normalizeHomePage(content: HomePageQueryResult): HomePageContent {
  return {
    title: content?.title || home.heading,
    // Keep the interim reset copy independent from the legacy home description
    // that remains in the non-destructively preserved Sanity dataset.
    intro: home.intro,
    body: content?.body?.length ? content.body : undefined,
  };
}
