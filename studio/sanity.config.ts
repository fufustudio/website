import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, previewOrigin, projectId } from "./env";
import { resolve } from "./presentation/resolve";
import { schema } from "./schemaTypes";
import { structure } from "./structure";

const singletonTypes = new Set(["siteSettings"]);

const studioPlugins = [
  structureTool({ structure }),
  presentationTool({
    resolve,
    previewUrl: {
      origin: previewOrigin,
      previewMode: {
        enable: "/api/draft-mode/enable",
        disable: "/api/draft-mode/disable",
      },
    },
  }),
  ...(process.env.NODE_ENV === "production"
    ? []
    : [visionTool({ defaultApiVersion: apiVersion })]),
];

export default defineConfig({
  projectId,
  dataset,
  schema,
  document: {
    newDocumentOptions: (prev) =>
      prev.filter((template) => !singletonTypes.has(template.templateId)),
  },
  plugins: studioPlugins,
});
