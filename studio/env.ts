export const apiVersion =
  process.env.SANITY_STUDIO_API_VERSION?.trim() || "2026-06-24";

export const dataset =
  process.env.SANITY_STUDIO_DATASET?.trim() || "production";

export const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID?.trim() || "your-project-id";

export const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN?.trim() || "http://localhost:3000";
