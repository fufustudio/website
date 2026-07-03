# Deploy And Launch

## Deploy

1. Import the GitHub repo in Vercel.
2. Add production environment variables.
3. Confirm the preview deployment builds.
4. Configure the production domain.
5. Redeploy after environment changes.

Required for production metadata:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID=8l26et78`
- `NEXT_PUBLIC_SANITY_DATASET=production`
- `NEXT_PUBLIC_SANITY_API_VERSION=2026-06-24`
- `RESEND_API_KEY` with a rotated key stored only in Vercel/local env
- `RESEND_FROM_EMAIL=Fufu <hello@fufu.studio>` after `fufu.studio` is verified
- `RESEND_TO_EMAIL=hello@fufu.studio`

Optional:

- `SANITY_API_READ_TOKEN`
- `SANITY_REVALIDATE_SECRET`
- `GOOGLE_SITE_VERIFICATION`

## Pre-Launch Checks

- Run `npm run verify:template`.
- Run `npm run verify:handoff` for client-site handoff when Playwright is ready.
- Run `npm run verify:ci` for browser checks.
- Run `npm run verify:release` when performance matters.
- Confirm the actual public route set, `/sitemap.xml`, `/robots.txt`, and `/opengraph-image` load.
- Confirm forms, analytics, metadata, and responsive layouts.
- Confirm Resend has a verified sending domain when contact delivery is enabled.
- Review `docs/security.md`, including the privacy policy and cookie consent notes.
- Remove starter examples that no longer serve the project.
