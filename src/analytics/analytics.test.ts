import { afterEach, describe, expect, it, vi } from "vitest";
import { logDevelopmentEvent } from "./destinations/development";
import { ga4ConsentAllows, toGa4Payload } from "./destinations/ga4";
import type { AnalyticsDestination } from "./destinations/types";
import { toVercelPayload } from "./destinations/vercel";
import type { AnalyticsEvent } from "./events";
import { configuredDestinations, dispatchAnalyticsEvent } from "./track-event";

const ctaEvent = {
  name: "cta_clicked",
  properties: {
    cta_id: "foundation",
    placement: "hero",
  },
} satisfies AnalyticsEvent;

const inquiryEvent = {
  name: "inquiry_submitted",
  properties: {
    form_id: "contact",
    placement: "homepage",
  },
} satisfies AnalyticsEvent;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("analytics destination mapping", () => {
  it("projects canonical CTA data into both destination formats", () => {
    expect(toVercelPayload(ctaEvent)).toEqual({
      name: "cta_clicked",
      properties: {
        cta_id: "foundation",
        placement: "hero",
      },
    });
    expect(toGa4Payload(ctaEvent)).toEqual({
      name: "cta_clicked",
      parameters: {
        cta_id: "foundation",
        placement: "hero",
      },
    });
  });

  it("maps a successful inquiry to GA4's recommended lead event", () => {
    expect(toVercelPayload(inquiryEvent)).toEqual({
      name: "inquiry_submitted",
      properties: {
        form_id: "contact",
        placement: "homepage",
      },
    });
    expect(toGa4Payload(inquiryEvent)).toEqual({
      name: "generate_lead",
      parameters: {
        lead_source: "website_contact_form",
        form_id: "contact",
        form_location: "homepage",
      },
    });
  });
});

describe("analytics dispatch", () => {
  it("renders canonical events as compact expandable development logs", () => {
    const group = vi
      .spyOn(console, "groupCollapsed")
      .mockImplementation(() => undefined);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const table = vi
      .spyOn(console, "table")
      .mockImplementation(() => undefined);
    const groupEnd = vi
      .spyOn(console, "groupEnd")
      .mockImplementation(() => undefined);

    logDevelopmentEvent(ctaEvent);

    expect(group).toHaveBeenCalledWith(
      "%c ANALYTICS %c %s %c %s ",
      expect.stringContaining("background:#6d28d9"),
      expect.stringContaining("color:#0f766e"),
      "cta_clicked",
      expect.stringContaining("color:#64748b"),
      "hero",
    );
    expect(log).toHaveBeenCalledWith("Canonical event", ctaEvent);
    expect(table).toHaveBeenCalledWith(ctaEvent.properties);
    expect(groupEnd).toHaveBeenCalledOnce();
  });

  it("isolates a failed destination and continues fan-out", () => {
    const successfulTrack = vi.fn();
    const destinations: AnalyticsDestination[] = [
      {
        id: "vercel",
        track() {
          throw new Error("provider unavailable");
        },
      },
      {
        id: "ga4",
        track: successfulTrack,
      },
    ];

    dispatchAnalyticsEvent(ctaEvent, destinations);

    expect(successfulTrack).toHaveBeenCalledWith(ctaEvent);
  });

  it("requires an explicit grant only in basic mode", () => {
    expect(
      ga4ConsentAllows({ enabled: true, consentMode: "basic" }, "unknown"),
    ).toBe(false);
    expect(
      ga4ConsentAllows({ enabled: true, consentMode: "basic" }, "denied"),
    ).toBe(false);
    expect(
      ga4ConsentAllows({ enabled: true, consentMode: "basic" }, "granted"),
    ).toBe(true);
    expect(
      ga4ConsentAllows({ enabled: true, consentMode: "immediate" }, "unknown"),
    ).toBe(true);
    expect(
      ga4ConsentAllows({ enabled: false, consentMode: "immediate" }, "granted"),
    ).toBe(false);
  });

  it("registers only destinations enabled by the shared configuration", () => {
    const vercel: AnalyticsDestination = { id: "vercel", track: vi.fn() };
    const ga4: AnalyticsDestination = { id: "ga4", track: vi.fn() };

    expect(
      configuredDestinations(
        {
          vercel: { enabled: false },
          ga4: { enabled: true },
        },
        { vercel, ga4 },
      ),
    ).toEqual([ga4]);
  });
});
