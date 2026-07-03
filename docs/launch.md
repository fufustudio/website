# Deploy And Launch

## Deploy

1. Import the GitHub repo in Vercel.
2. Add production environment variables.
3. Confirm the preview deployment builds.
4. Configure the production domain.
5. Redeploy after environment changes.

Required for production metadata:

- `NEXT_PUBLIC_SITE_URL`

Optional:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN`
- `SANITY_REVALIDATE_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TO_EMAIL`
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
