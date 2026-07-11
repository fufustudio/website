import { describe, expect, it } from "vitest";
import { imageSrc } from "../config/cms-images";

describe("imageSrc", () => {
  it("leaves final format conversion to the Next.js image optimizer", () => {
    const src = imageSrc({
      asset: { _ref: "image-example-1200x800-jpg" },
    });

    expect(new URL(src as string).pathname).toMatch(
      /\/images\/[^/]+\/[^/]+\/example-1200x800\.jpg$/,
    );
    expect(src).not.toContain("auto=format");
  });
});
