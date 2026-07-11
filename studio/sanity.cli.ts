import { defineCliConfig } from "sanity/cli";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID?.trim() ?? "your-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET?.trim() ?? "production";

export default defineCliConfig({
  api: { projectId, dataset },
  typegen: {
    enabled: true,
    path: "../src/**/*.{ts,tsx}",
    schema: "./schema.json",
    generates: "../sanity.types.ts",
    overloadClientMethods: true,
  },
});
