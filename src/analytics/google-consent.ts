import {
  analyticsConsentStorageKey,
  analyticsConsentVersion,
} from "@/analytics/consent";
import type { GoogleAnalyticsConsentMode } from "@/config/env";

type GoogleConsentValue = "granted" | "denied";

type GoogleConsentUpdate = {
  analytics_storage: GoogleConsentValue;
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function googleConsentInitializationScript(
  mode: GoogleAnalyticsConsentMode,
) {
  const analyticsStorage = mode === "immediate" ? "granted" : "denied";
  const serializedStorageKey = JSON.stringify(analyticsConsentStorageKey);
  const restorePersistedConsent =
    mode === "basic"
      ? `
try {
  var storedConsent = JSON.parse(
    window.localStorage.getItem(${serializedStorageKey})
  );
  if (
    storedConsent.version === ${analyticsConsentVersion} &&
    storedConsent.analytics === "granted"
  ) {
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }
} catch {}
`
      : "";

  return `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
window.gtag("consent", "default", {
  analytics_storage: "${analyticsStorage}",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied"
});
window.gtag("set", "allow_google_signals", false);
window.gtag("set", "allow_ad_personalization_signals", false);
${restorePersistedConsent}
`;
}

export function updateGoogleConsent(analytics: GoogleConsentValue) {
  if (typeof window === "undefined") return;

  const update: GoogleConsentUpdate = {
    analytics_storage: analytics,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };

  window.gtag?.("consent", "update", update);
}
