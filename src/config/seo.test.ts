import { describe, expect, it } from "vitest";
import { pageMetadata } from "./seo";

const siteSettings = {
  name: "Acme",
  tagline: "Carefully made widgets.",
  url: "https://acme.example",
};

describe("pageMetadata", () => {
  it("leaves social image URLs to Next.js file-based metadata", () => {
    const metadata = pageMetadata({
      siteSettings,
      title: "About",
      description: "About page",
      path: "/about",
    });

    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });

  it("uses the normalized site identity for page and social metadata", () => {
    const metadata = pageMetadata({ siteSettings, path: "/" });

    expect(metadata.title).toBe("Acme");
    expect(metadata.description).toBe("Carefully made widgets.");
    expect(metadata.openGraph).toMatchObject({
      title: "Acme",
      description: "Carefully made widgets.",
      siteName: "Acme",
      url: "/",
    });
  });

  it("does not add a canonical URL when a route has not supplied one", () => {
    const metadata = pageMetadata({ siteSettings });

    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).not.toHaveProperty("url");
  });
});
