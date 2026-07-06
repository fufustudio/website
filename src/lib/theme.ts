/**
 * Role palette for contexts that can't read CSS variables (the OG image runs
 * in the edge runtime). Keep these values in sync with the `@theme` block in
 * `globals.css` — together they are the rebrand surface.
 */
export const theme = {
  bg: "#f6f4ef",
  fg: "#12131a",
  body: "rgb(18 19 26 / 0.72)",
  surface: "rgb(18 19 26 / 0.05)",
  muted: "rgb(18 19 26 / 0.14)",
  accent: "#375d6c",
  accentSoft: "#fad99d",
  feature: "#dead89",
  light: "#f6f4ef",
} as const;
