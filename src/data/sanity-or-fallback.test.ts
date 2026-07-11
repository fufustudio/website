import { describe, expect, it, vi } from "vitest";
import { requireSanityDocument, sanityOrFallback } from "./sanity-or-fallback";

describe("sanityOrFallback", () => {
  it("uses local content without calling Sanity when it is unconfigured", async () => {
    const load = vi.fn(async () => "cms");

    await expect(sanityOrFallback(load, () => "local", false)).resolves.toBe(
      "local",
    );
    expect(load).not.toHaveBeenCalled();
  });

  it("returns Sanity content when it is configured", async () => {
    await expect(
      sanityOrFallback(
        async () => "cms",
        () => "local",
        true,
      ),
    ).resolves.toBe("cms");
  });

  it("surfaces configured Sanity failures instead of returning local content", async () => {
    const error = new Error("Sanity unavailable");

    await expect(
      sanityOrFallback(
        async () => Promise.reject(error),
        () => "local",
        true,
      ),
    ).rejects.toBe(error);
  });
});

describe("requireSanityDocument", () => {
  it("fails clearly when a configured dataset is missing required content", () => {
    expect(() => requireSanityDocument(null, 'page with slug "home"')).toThrow(
      '[sanity] Missing required page with slug "home" in the configured dataset.',
    );
  });
});
