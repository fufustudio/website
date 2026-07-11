import { describe, expect, it } from "vitest";

import { sanityStudioFrameAncestors } from "./security";

describe("sanityStudioFrameAncestors", () => {
  it("allows only self when production Studio is not configured", () => {
    expect(sanityStudioFrameAncestors(undefined, true)).toEqual(["'self'"]);
  });

  it("allows local Studio in development", () => {
    expect(sanityStudioFrameAncestors(undefined, false)).toEqual([
      "'self'",
      "http://localhost:3333",
    ]);
  });

  it("normalizes an explicitly trusted Studio URL to its origin", () => {
    expect(
      sanityStudioFrameAncestors(
        "https://example.sanity.studio/presentation",
        true,
      ),
    ).toEqual(["'self'", "https://example.sanity.studio"]);
  });

  it("ignores non-http and malformed values", () => {
    expect(sanityStudioFrameAncestors("javascript:alert(1)", true)).toEqual([
      "'self'",
    ]);
  });
});
