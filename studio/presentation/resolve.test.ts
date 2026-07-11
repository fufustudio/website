import { describe, expect, it } from "vitest";

import {
  resolve,
  resolveHomePageLocation,
  siteSettingsLocation,
} from "./resolve";

describe("Presentation document resolution", () => {
  it("treats the home page document as the main document for /", () => {
    expect(resolve?.mainDocuments).toEqual([
      {
        route: "/",
        filter: '_type == "page" && slug.current == "home"',
      },
    ]);
  });

  it("maps only the home page to the public site", () => {
    expect(
      resolveHomePageLocation({ title: "Homepage", slug: "home" }),
    ).toEqual({ locations: [{ title: "Homepage", href: "/" }] });
    expect(resolveHomePageLocation({ title: "About", slug: "about" })).toEqual({
      locations: [],
    });
  });

  it("maps site settings to the homepage and leaves services unmapped", () => {
    expect(siteSettingsLocation).toEqual({
      locations: [{ title: "Site-wide settings", href: "/" }],
    });
    expect(resolve?.locations).not.toHaveProperty("service");
  });
});
