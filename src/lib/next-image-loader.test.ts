import { describe, expect, it } from "vitest";

import sanityNextImageLoader from "./next-image-loader";

describe("sanityNextImageLoader", () => {
  it("adds Sanity CDN image transformation params", () => {
    const src = sanityNextImageLoader({
      src: "https://cdn.sanity.io/images/project/production/example-1200x800.jpg",
      width: 640,
    });

    expect(src).toBe(
      "https://cdn.sanity.io/images/project/production/example-1200x800.jpg?w=640&q=75&auto=format",
    );
  });

  it("leaves ordinary local images unchanged", () => {
    const src = "/favicon.ico";

    expect(sanityNextImageLoader({ src, width: 640 })).toBe(src);
  });

  it("leaves non-Sanity remote images unchanged", () => {
    const src = "https://example.com/portrait.jpg";

    expect(sanityNextImageLoader({ src, width: 640 })).toBe(src);
  });

  it("clamps Sanity image width requests to the source image width", () => {
    const src =
      "https://cdn.sanity.io/images/project/production/example-1200x800.jpg";

    expect(sanityNextImageLoader({ src, width: 1920 })).toBe(
      "https://cdn.sanity.io/images/project/production/example-1200x800.jpg?w=1200&q=75&auto=format",
    );
  });
});
