# Deploy And Launch

## Deploy

1. Import the GitHub repo in Vercel.
2. Add production environment variables.
3. Confirm the preview deployment builds.
4. Configure the production domain.
5. Redeploy after environment changes. Vercel does not apply changed env vars to
   an already-built deployment.

## Vercel Environment Variables

| Variable                         | Required                        | Example                       | Notes                                               |
| -------------------------------- | ------------------------------- | ----------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Yes                             | `https://www.example.com`     | Used for metadata, canonicals, sitemap, and robots. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | For live CMS                    | `your-project-id`             | Leave unset only for starter/local fallback work.   |
| `NEXT_PUBLIC_SANITY_DATASET`     | For live CMS                    | `production`                  | Match the Sanity dataset.                           |
| `NEXT_PUBLIC_SANITY_API_VERSION` | For live CMS                    | `2026-06-24`                  | Keep pinned per project.                            |
| `NEXT_PUBLIC_SANITY_STUDIO_URL`  | For visual editing              | `https://site.sanity.studio`  | Trusted Studio origin; no path.                     |
| `SANITY_ALLOW_CONFIG_MISMATCH`   | Rarely                          | `false`                       | Opt out only when web and Studio differ by design.  |
| `SANITY_API_READ_TOKEN`          | For visual editing              | Viewer token                  | Server-only; enables authenticated draft preview.   |
| `SANITY_REVALIDATE_SECRET`       | Optional                        | generated secret              | Add only when webhooks revalidate content.          |
| `RESEND_API_KEY`                 | For production message delivery | `re_...`                      | Server-only.                                        |
| `RESEND_FROM_EMAIL`              | For production message delivery | `Website <hello@example.com>` | Must use a verified sending domain.                 |
| `RESEND_TO_EMAIL`                | For production message delivery | `contact@example.com`         | Recipient inbox for inquiries.                      |
| `UPSTASH_REDIS_REST_URL`         | For production contact form     | provider URL                  | Server-only shared rate-limit store.                |
| `UPSTASH_REDIS_REST_TOKEN`       | For production contact form     | provider token                | Server-only shared rate-limit credential.           |
| `KV_REST_API_URL`                | Alternative rate-limit store    | provider URL                  | Injected by Vercel Marketplace Upstash integration. |
| `KV_REST_API_TOKEN`              | Alternative rate-limit token    | provider token                | Injected by Vercel Marketplace Upstash integration. |
| `GOOGLE_SITE_VERIFICATION`       | Optional                        | token                         | Search Console verification.                        |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`  | Optional                        | `G-XXXXXXXXXX`                | GA4 Measurement ID only; do not paste the script.   |

Redeploy after adding or changing any Vercel env var.

The standalone Studio also needs
`SANITY_STUDIO_PREVIEW_ORIGIN=https://www.example.com`. Deploy each Studio/web
environment with matching HTTPS origins, and add every previewed web origin to
Sanity CORS with credentials enabled. `launch:check` requires the Viewer token
and both origins when any preview setting is present.

## Pre-Launch Checks

- Run `npm run verify` for full local verification.
- Run `npm run verify:template` before starter/template handoff.
- Run `npm run launch:check` after production env vars and client fallback
  content are configured.
- The launch check compares the web and standalone Studio Sanity project ID,
  dataset, and API version when both configurations are present. A mismatch
  usually means editors would publish somewhere the website does not read.
  Set `SANITY_ALLOW_CONFIG_MISMATCH=true` only for a deliberately split setup.
- Run `npm run verify:handoff` for client-site handoff when Playwright is ready.
- Install the Playwright browser once with `npm run playwright:install` before
  running the client handoff gate on a new machine.
- Run `npm run verify:release` for the client handoff gate plus Lighthouse.
- Confirm the actual public route set, `/sitemap.xml`, `/robots.txt`, and `/opengraph-image` load.
- Confirm Presentation can frame the deployed site, drafts remain private,
  click-to-edit opens the correct fields, and exiting Draft Mode restores
  published content.
- Confirm forms, analytics, metadata, and responsive layouts.
- Confirm Google Analytics appears in Tag Assistant only when
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured.
- Confirm Resend has a verified sending domain when contact delivery is enabled.
- Confirm the Upstash limiter is configured and returns `429` after the contact
  request budget is exhausted.
- Confirm `/privacy` has the client legal/business name, public contact email,
  effective date, actual analytics tools, email provider or inbox, Resend usage,
  Sanity data use, and any CRM, newsletter, ads, chat, heatmaps, CAPTCHA, or
  cookie tools.
- Provider checks inspect visitor-facing `/privacy` source separately from
  internal setup docs. Mentioning a provider in engineering documentation does
  not count as telling visitors about it.
- Review `docs/security.md`, including the privacy policy and cookie consent
  notes.

`verify:handoff` intentionally does not run `template:clean`; that old-client
string scanner is for the reusable starter repo and can reject legitimate client
language. Client launch readiness is enforced by `launch:check` instead.
