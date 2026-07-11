import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

export function resolveHomePageLocation(
  document: { title?: string; slug?: string } | null,
) {
  if (document?.slug !== "home") return { locations: [] };

  return {
    locations: [{ title: document.title || "Home", href: "/" }],
  };
}

export const homePageLocation = defineLocations({
  select: { title: "title", slug: "slug.current" },
  resolve: resolveHomePageLocation,
});

export const siteSettingsLocation = defineLocations({
  locations: [{ title: "Site-wide settings", href: "/" }],
});

export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    {
      route: "/",
      filter: '_type == "page" && slug.current == "home"',
    },
  ]),
  locations: {
    page: homePageLocation,
    siteSettings: siteSettingsLocation,
  },
};
