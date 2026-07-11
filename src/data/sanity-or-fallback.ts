import "server-only";

import { isSanityConfigured } from "@/sanity/lib/client";

export async function sanityOrFallback<T>(
  load: () => Promise<T>,
  fallback: () => T,
  configured = isSanityConfigured,
): Promise<T> {
  if (!configured) return fallback();

  // A configured CMS is the production content source. Let fetch, permission,
  // and query errors reach Next.js so a broken integration cannot be cached as
  // a successful response containing starter content.
  return load();
}

export function requireSanityDocument<T>(
  value: T | null,
  description: string,
): T {
  if (value !== null) return value;

  throw new Error(
    `[sanity] Missing required ${description} in the configured dataset.`,
  );
}
