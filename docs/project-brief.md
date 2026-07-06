# Project Brief

| Field             | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| Project/site name | Fufu Studio                                               |
| Design source     | Claude design archive: `Play Instrument Pair Updates.zip` |

## Environment Variables

| Field                            | Value                                            |
| -------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`           | production domain, or `http://localhost:3000`    |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | optional for local fallback                      |
| `NEXT_PUBLIC_SANITY_DATASET`     | `production`                                     |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2026-06-24`                                     |
| `SANITY_API_READ_TOKEN`          | optional; only for draft/live preview            |
| `SANITY_REVALIDATE_SECRET`       | optional; only for webhook revalidation          |
| `RESEND_API_KEY`                 | server-only; required for contact delivery       |
| `RESEND_FROM_EMAIL`              | verified sender, e.g. `Fufu <hello@fufu.studio>` |
| `RESEND_TO_EMAIL`                | `hello@fufu.studio` unless changed               |
| `GOOGLE_SITE_VERIFICATION`       | optional; only for Search Console                |

## Source Notes

The Claude design is authoritative for the one-page structure, copy, palette,
typography, and motion direction. The included WebP files are spectrum
reference images, not portrait assets. Portrait regions should ship as stable
placeholders until real photos are provided.
