export function optionalEnvValue(value: string | undefined) {
  return value?.trim() || undefined;
}

export const publicEnv = {
  sanityProjectId: optionalEnvValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  sanityDataset:
    optionalEnvValue(process.env.NEXT_PUBLIC_SANITY_DATASET) ?? "production",
  sanityApiVersion:
    optionalEnvValue(process.env.NEXT_PUBLIC_SANITY_API_VERSION) ??
    "2026-06-24",
  siteUrl:
    optionalEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ??
    "http://localhost:3000",
  googleAnalyticsId:
    optionalEnvValue(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) ??
    "G-Q8ZQF7VMNL",
};
