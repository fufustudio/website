import { publicEnv } from "@/config/env";

export const analyticsConfig = {
  vercel: {
    enabled: publicEnv.vercelAnalyticsEnabled,
  },
  ga4: {
    enabled: Boolean(publicEnv.googleAnalyticsMeasurementId),
    measurementId: publicEnv.googleAnalyticsMeasurementId,
    consentMode: publicEnv.googleAnalyticsConsentMode,
  },
} as const;
