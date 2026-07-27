/* eslint-disable @next/next/no-before-interactive-script-outside-document -- App Router permits root-layout beforeInteractive scripts, and SiteScripts is mounted only by that layout. */
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { analyticsConfig } from "@/analytics/config";
import { googleConsentInitializationScript } from "@/analytics/google-consent";
import { AnalyticsConsentManager } from "@/components/analytics-consent-manager";

export function SiteScripts() {
  const gaId = analyticsConfig.ga4.measurementId;

  return (
    <>
      {analyticsConfig.vercel.enabled ? <Analytics /> : null}
      <SpeedInsights />
      {gaId ? (
        <>
          <Script
            id="google-consent-defaults"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: googleConsentInitializationScript(
                analyticsConfig.ga4.consentMode,
              ),
            }}
          />
          {analyticsConfig.ga4.consentMode === "immediate" ? (
            <GoogleAnalytics gaId={gaId} />
          ) : (
            <AnalyticsConsentManager
              gaId={gaId}
              consentMode={analyticsConfig.ga4.consentMode}
              vercelAnalyticsEnabled={analyticsConfig.vercel.enabled}
            />
          )}
        </>
      ) : null}
    </>
  );
}
