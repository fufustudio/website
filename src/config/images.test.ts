import { describe, expect, it } from "vitest";
import { sanityImageRemotePatterns } from "./images";

describe("sanityImageRemotePatterns", () => {
  it("allows only the configured Sanity project and dataset", () => {
    expect(
      sanityImageRemotePatterns({
        NEXT_PUBLIC_SANITY_PROJECT_ID: "project123",
        NEXT_PUBLIC_SANITY_DATASET: "staging",
      }),
    ).toEqual([
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/project123/staging/**",
      },
    ]);
  });

  it("does not expose a remote optimizer when Sanity is unconfigured", () => {
    expect(sanityImageRemotePatterns({})).toEqual([]);
  });
});
