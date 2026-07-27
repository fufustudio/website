import type { AnalyticsEvent } from "@/analytics/events";

export type AnalyticsDestination = {
  id: "development" | "vercel" | "ga4";
  track(event: AnalyticsEvent): void;
};
