# Project Brief Template

Use this as the minimal user-entered intake for each design-to-site build. Leave
unknown values blank. Do not paste secret values into shared docs.

| Field             | Value |
| ----------------- | ----- |
| Project/site name |       |
| Figma link        |       |

## Privacy Intake

| Field                                               | Value |
| --------------------------------------------------- | ----- |
| Legal or business name for `/privacy`               |       |
| Public privacy contact email                        |       |
| Privacy policy effective date                       |       |
| Analytics tools in use                              |       |
| Email provider or inquiry inbox                     |       |
| Durable inquiry system of record (inbox/CRM/other)  |       |
| Marketing subscription enabled and consent process? |       |
| Resend used for contact delivery?                   |       |
| Sanity stores public content only, or also leads?   |       |
| CRM, newsletter, ads, chat, heatmaps, CAPTCHA, etc. |       |

## Environment Variables

| Field                                  | Value                                                |
| -------------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | production `https://` domain                         |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`        |                                                      |
| `NEXT_PUBLIC_SANITY_DATASET`           | `production`                                         |
| `NEXT_PUBLIC_SANITY_API_VERSION`       | `2026-06-24`                                         |
| `NEXT_PUBLIC_SANITY_STUDIO_URL`        | standalone Studio origin                             |
| `SANITY_STUDIO_PREVIEW_ORIGIN`         | deployed web origin                                  |
| `SANITY_API_READ_TOKEN`                | optional Viewer token for draft/live preview         |
| `SANITY_REVALIDATE_SECRET`             | optional; only for webhook revalidation              |
| `RESEND_API_KEY`                       | server-only; required for contact delivery           |
| `RESEND_FROM_EMAIL`                    | verified sender, e.g. `Website <hello@example.com>`  |
| `RESEND_TO_EMAIL`                      | recipient inbox, e.g. `contact@example.com`          |
| `UPSTASH_REDIS_REST_URL`               | server-only shared rate-limit store                  |
| `UPSTASH_REDIS_REST_TOKEN`             | server-only shared rate-limit credential             |
| `KV_REST_API_URL`                      | Vercel Marketplace rate-limit store alternative      |
| `KV_REST_API_TOKEN`                    | Vercel Marketplace rate-limit credential alternative |
| `GOOGLE_SITE_VERIFICATION`             | optional; only for Search Console                    |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`        | optional GA4 Measurement ID, e.g. `G-...`            |
| `NEXT_PUBLIC_GA_CONSENT_MODE`          | `basic` by default; `immediate` only after review    |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED` | `true` by default; set `false` to disable            |

The design is authoritative for copy, palette, typography, assets, routes,
layout, and responsive behavior. The agent snapshots the completed intake to
`docs/project-brief.md`, then tracks execution in `docs/client-build-plan.md`.
