import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("Next.js security headers", () => {
  it("enables the current rendering and global fallback defaults", () => {
    expect(nextConfig.cacheComponents).toBe(true);
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(nextConfig.experimental?.globalNotFound).toBe(true);
  });

  it("allows the trusted development Studio to frame Presentation without conflicting X-Frame-Options", async () => {
    expect(typeof nextConfig.headers).toBe("function");

    const rules = await nextConfig.headers!();
    const headers = rules.flatMap((rule) => rule.headers);
    const csp = headers.find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;

    expect(headers).not.toContainEqual(
      expect.objectContaining({ key: "X-Frame-Options" }),
    );
    expect(csp).toContain("frame-ancestors 'self' http://localhost:3333");
  });
});
