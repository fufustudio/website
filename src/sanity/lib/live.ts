import "server-only";

import { cookies, draftMode } from "next/headers";
import { cache } from "react";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  type LivePerspective,
} from "next-sanity/live";

import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN?.trim() || undefined;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
  strict: true,
});

export type DynamicFetchOptions = {
  perspective: LivePerspective;
  stega: boolean;
};

export const publishedFetchOptions = {
  perspective: "published",
  stega: false,
} as const satisfies DynamicFetchOptions;

export const getDynamicFetchOptions = cache(
  async (): Promise<DynamicFetchOptions> => {
    if (!token) return publishedFetchOptions;

    const { isEnabled: isDraftMode } = await draftMode();
    if (!isDraftMode) return publishedFetchOptions;

    const perspective = await resolvePerspectiveFromCookies({
      cookies: await cookies(),
    });

    return {
      perspective: perspective ?? "drafts",
      stega: true,
    };
  },
);
