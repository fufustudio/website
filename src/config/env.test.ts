import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  envBoolean,
  googleAnalyticsConsentMode,
  optionalEnvValue,
} from "./env";

describe("optionalEnvValue", () => {
  it("trims values and returns undefined for empty input", () => {
    expect(optionalEnvValue(" value ")).toBe("value");
    expect(optionalEnvValue("   ")).toBeUndefined();
    expect(optionalEnvValue(undefined)).toBeUndefined();
  });
});

describe("analytics environment", () => {
  it("parses explicit provider controls and safe consent defaults", () => {
    expect(envBoolean(undefined, "FLAG", true)).toBe(true);
    expect(envBoolean(" false ", "FLAG", true)).toBe(false);
    expect(() => envBoolean("yes", "FLAG", true)).toThrow(
      'FLAG must be "true" or "false".',
    );

    expect(googleAnalyticsConsentMode(undefined)).toBe("basic");
    expect(googleAnalyticsConsentMode("basic")).toBe("basic");
    expect(googleAnalyticsConsentMode(" IMMEDIATE ")).toBe("immediate");
    expect(() => googleAnalyticsConsentMode("advanced")).toThrow(
      'NEXT_PUBLIC_GA_CONSENT_MODE must be "basic" or "immediate".',
    );
  });
});

describe("public env access", () => {
  it("keeps browser-bound variables statically addressable by Next", () => {
    const source = readFileSync(new URL("./env.ts", import.meta.url), "utf8");

    expect(source).not.toContain("process.env[");
    expect(source).toContain("process.env.NEXT_PUBLIC_SANITY_PROJECT_ID");
    expect(source).toContain("process.env.NEXT_PUBLIC_SANITY_DATASET");
    expect(source).toContain(
      "process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED",
    );
    expect(source).toContain("process.env.NEXT_PUBLIC_GA_CONSENT_MODE");
  });
});
