import { trackEvent } from "@/analytics/track-event";

trackEvent("cta_clicked", {
  cta_id: "hero-contact",
  placement: "hero",
});

trackEvent("inquiry_submitted", {
  form_id: "contact",
  placement: "homepage",
});

// @ts-expect-error event names are restricted to the canonical tracking plan
trackEvent("card_click", {
  cta_id: "card",
  placement: "section",
});

trackEvent("cta_clicked", {
  cta_id: "hero-contact",
  // @ts-expect-error placements are bounded canonical values
  placement: "sidebar",
});

// @ts-expect-error inquiry events require their exact canonical properties
trackEvent("inquiry_submitted", {
  form_id: "contact",
});
