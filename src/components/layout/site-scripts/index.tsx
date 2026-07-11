import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { publicEnv } from "@/config/env";

export function SiteScripts() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      {publicEnv.googleAnalyticsMeasurementId ? (
        <GoogleAnalytics gaId={publicEnv.googleAnalyticsMeasurementId} />
      ) : null}
    </>
  );
}
