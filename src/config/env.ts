export function optionalEnvValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function envValue(value: string | undefined, fallback?: string) {
  return optionalEnvValue(value) ?? fallback;
}

export const publicEnv = {
  googleAnalyticsMeasurementId: envValue(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  ),
  sanityProjectId: envValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  sanityDataset:
    envValue(process.env.NEXT_PUBLIC_SANITY_DATASET) ?? "production",
  sanityApiVersion:
    envValue(process.env.NEXT_PUBLIC_SANITY_API_VERSION) ?? "2026-06-24",
  sanityStudioUrl: envValue(
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    process.env.NODE_ENV === "development"
      ? "http://localhost:3333"
      : undefined,
  ),
  siteUrl:
    envValue(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
};
