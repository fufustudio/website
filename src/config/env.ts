export function optionalEnvValue(value: string | undefined) {
  return value?.trim() || undefined;
}

export type GoogleAnalyticsConsentMode = "basic" | "immediate";

function envValue(value: string | undefined, fallback?: string) {
  return optionalEnvValue(value) ?? fallback;
}

export function envBoolean(
  value: string | undefined,
  name: string,
  fallback: boolean,
) {
  const normalized = optionalEnvValue(value)?.toLowerCase();

  if (!normalized) return fallback;
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw new Error(`${name} must be "true" or "false".`);
}

export function googleAnalyticsConsentMode(
  value: string | undefined,
): GoogleAnalyticsConsentMode {
  const normalized = optionalEnvValue(value)?.toLowerCase();

  if (!normalized || normalized === "basic") return "basic";
  if (normalized === "immediate") return "immediate";

  throw new Error(
    'NEXT_PUBLIC_GA_CONSENT_MODE must be "basic" or "immediate".',
  );
}

export const publicEnv = {
  vercelAnalyticsEnabled: envBoolean(
    process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED,
    "NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED",
    true,
  ),
  googleAnalyticsMeasurementId: envValue(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  ),
  googleAnalyticsConsentMode: googleAnalyticsConsentMode(
    process.env.NEXT_PUBLIC_GA_CONSENT_MODE,
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
