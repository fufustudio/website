import { sendGAEvent } from "@next/third-parties/google";
import { analyticsConfig } from "@/analytics/config";
import {
  getAnalyticsConsentSnapshot,
  type AnalyticsConsent,
} from "@/analytics/consent";
import type { AnalyticsEvent } from "@/analytics/events";
import type { GoogleAnalyticsConsentMode } from "@/config/env";
import type { AnalyticsDestination } from "./types";

type Ga4Payload = {
  name: string;
  parameters: Record<string, string | number | boolean>;
};

export function toGa4Payload(event: AnalyticsEvent): Ga4Payload {
  switch (event.name) {
    case "cta_clicked":
      return {
        name: event.name,
        parameters: {
          cta_id: event.properties.cta_id,
          placement: event.properties.placement,
        },
      };
    case "inquiry_submitted":
      return {
        name: "generate_lead",
        parameters: {
          lead_source: "website_contact_form",
          form_id: event.properties.form_id,
          form_location: event.properties.placement,
        },
      };
  }
}

export function canSendToGa4() {
  return ga4ConsentAllows(
    {
      enabled: analyticsConfig.ga4.enabled,
      consentMode: analyticsConfig.ga4.consentMode,
    },
    getAnalyticsConsentSnapshot(),
  );
}

export function ga4ConsentAllows(
  config: {
    enabled: boolean;
    consentMode: GoogleAnalyticsConsentMode;
  },
  consent: AnalyticsConsent,
) {
  if (!config.enabled) return false;
  if (config.consentMode === "immediate") return true;
  return consent === "granted";
}

export const ga4Destination: AnalyticsDestination = {
  id: "ga4",
  track(event) {
    if (!canSendToGa4()) return;

    const payload = toGa4Payload(event);
    sendGAEvent("event", payload.name, payload.parameters);
  },
};
