import { describe, expect, it } from "vitest";
import { googleConsentInitializationScript } from "./google-consent";
import {
  analyticsConsentStorageKey,
  analyticsConsentVersion,
  parseAnalyticsConsent,
} from "./consent";

describe("analytics consent persistence", () => {
  it("accepts only the current version and supported values", () => {
    expect(
      parseAnalyticsConsent(
        JSON.stringify({
          version: analyticsConsentVersion,
          analytics: "granted",
        }),
      ),
    ).toBe("granted");
    expect(
      parseAnalyticsConsent(
        JSON.stringify({
          version: analyticsConsentVersion,
          analytics: "denied",
        }),
      ),
    ).toBe("denied");
    expect(
      parseAnalyticsConsent(
        JSON.stringify({
          version: analyticsConsentVersion + 1,
          analytics: "granted",
        }),
      ),
    ).toBe("unknown");
    expect(
      parseAnalyticsConsent(
        JSON.stringify({
          version: analyticsConsentVersion,
          analytics: "maybe",
        }),
      ),
    ).toBe("unknown");
    expect(parseAnalyticsConsent("not-json")).toBe("unknown");
    expect(parseAnalyticsConsent(null)).toBe("unknown");
  });

  it("queues privacy-first Google defaults before provider initialization", () => {
    const basic = googleConsentInitializationScript("basic");
    const immediate = googleConsentInitializationScript("immediate");

    expect(basic).toContain('analytics_storage: "denied"');
    expect(basic).toContain(analyticsConsentStorageKey);
    expect(basic).toContain(
      `storedConsent.version === ${analyticsConsentVersion}`,
    );
    expect(immediate).toContain('analytics_storage: "granted"');
    expect(immediate).not.toContain("storedConsent");

    for (const script of [basic, immediate]) {
      expect(script).toContain('ad_storage: "denied"');
      expect(script).toContain('"allow_google_signals", false');
      expect(script).toContain('"allow_ad_personalization_signals", false');
    }
  });
});
