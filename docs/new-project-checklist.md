# New Project Checklist

Use this when creating a project from `fufustudio/fufu-starter`.

## First Hour

- Create the new repo with GitHub's "Use this template" flow.
- Rename `package.json` `name` and README title, then update the local site
  identity in `src/content/site.ts`.
- Copy `.env.example` to `.env.local`.
- Copy `studio/.env.example` to `studio/.env.local`.
- Set `NEXT_PUBLIC_SITE_URL` for local or preview work. Use the production
  `https://` URL before launch.
- Run `npm install`.
- Run `npm --prefix studio install`.
- Run `npm run dev` and check the starter route: `/`.
- Run `npm run studio:dev` and check the standalone authoring app.

## Product Shape

- For design-led builds, snapshot intake into `docs/project-brief.md`, create a live build plan from `docs/client-build-plan.template.md`, and follow `docs/design-to-site.md`.
- Provide Figma MCP frame or layer links when possible. If using screenshots, include exported assets and document assumptions.
- Configure Sanity for the client project. Keep local fallbacks working until credentials are available.
- Add real routes and route metadata.
- Review `/privacy` and update the business name, public contact email,
  effective date, providers, and data flows before launch.
- Replace starter fallback content, upload reusable/editable content and media
  to Sanity, then remove project-specific local fallback images once the live
  dataset is seeded.
- Add real brand tokens in `src/styles/globals.css` and mirror core values in
  `src/config/theme.ts`.
- Add favicon and real visual assets only when the project needs them.

## Route Replacement Checklist

- Update `src/app` with the actual public route set.
- Keep each page's composition in a colocated `components` folder. Introduce a
  feature layer only for substantial behavior shared across routes.
- Update `src/content` for local content or remove unused starter content.
- Update the local site identity in `src/content/site.ts` and navigation in
  `src/components/navigation.ts`.
- Update `src/app/sitemap.ts`.
- Update route metadata and OpenGraph requirements.
- Update `tests/e2e/site-smoke.spec.ts` when routes are removed, renamed, or added.
- Remove unused starter route folders, components, content, and tests.

## Sanity Setup

- Create a Sanity project and dataset.
- Add the web `NEXT_PUBLIC_SANITY_*` values and matching
  `SANITY_STUDIO_*` values in `studio/.env.local`.
- Set `NEXT_PUBLIC_SANITY_STUDIO_URL` to the standalone Studio origin and
  `SANITY_STUDIO_PREVIEW_ORIGIN` to the web origin.
- Create a Viewer token for `SANITY_API_READ_TOKEN`; never use a write-capable
  token or expose it as a public variable.
- Keep project ID, dataset, and API version identical between web and Studio.
  If they intentionally differ, document why and set
  `SANITY_ALLOW_CONFIG_MISMATCH=true` for the launch check.
- Log in to the Sanity CLI with the account that belongs to the project.
- Add local and deployed origins in Sanity CORS settings with credentials
  enabled. Include the active Next dev ports, usually
  `http://localhost:3000` and `http://localhost:3001`.
- Restart the relevant web or Studio process after changing its env file.
- Start Studio with `npm run studio:dev` and confirm login works at port 3333.
- Open Presentation, confirm `/` loads without framing errors, edit the home
  title without publishing, and confirm the preview updates and is clickable.
- Open the web preview directly, use Exit Preview, and confirm published
  content returns.
- If Studio links to a Sanity Manage URL with `your-project-id`, fix the public
  env values or static env access before continuing.
- Run `SANITY_DRY_RUN=1 npm run sanity:seed`.
- Run `npm run sanity:seed` only if the starter `siteSettings` and `home`
  content are still useful.
- Confirm both required baseline documents exist. A configured web app fails
  visibly when either is missing instead of falling back to starter copy.
- Run `npm run verify:content` after the live dataset should be valid.

## Optional Forms And Analytics

- Choose the form provider or replace the starter handler.
- Decide whether the inquiry inbox or a CRM is the durable lead system of
  record. If adding a CRM, extend `processInquiry` with a server-only
  destination and follow the capture-versus-notification contract in
  `docs/forms-analytics.md`.
- For the built-in Attio destination, add `ATTIO_ACCESS_TOKEN` and
  `ATTIO_INBOUND_LIST_ID` together and configure the list fields documented in
  `docs/forms-analytics.md`.
- For Resend contact delivery, add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
  `RESEND_TO_EMAIL` as server-only environment variables.
- Add either `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or
  Vercel Marketplace's `KV_REST_API_URL` and `KV_REST_API_TOKEN`, as
  server-only environment variables for shared contact-form rate limiting.
- Verify the sending domain in Resend before production delivery.
- For Google Analytics 4, add `NEXT_PUBLIC_GA_MEASUREMENT_ID` with only the
  `G-...` Measurement ID. Do not paste Google's full `<script>` snippet into
  the app.
- Keep `NEXT_PUBLIC_GA_CONSENT_MODE=basic` unless a launch-specific privacy
  review documents why immediate loading is appropriate.
- Verify no Google script or request occurs before acceptance, decline persists
  across navigation and reload, withdrawal removes Google after reload, and
  the footer preference control is keyboard accessible.
- Set `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=false` when Vercel Analytics should
  not collect automatic pageviews or canonical custom events.
- Confirm `inquiry_submitted` tracks only after a real successful submission.
- Confirm inquiry submission IDs deduplicate safe retries without entering
  analytics, URLs, or visitor-facing copy.
- Add or rename canonical analytics events in `AnalyticsEventMap`, project them
  explicitly in each destination adapter, and fire them near the component that
  owns the interaction.
- Reflect every provider that touches visitor data in `/privacy`, including
  email, CMS lead storage, CRM, newsletter, ads, chat, heatmaps, CAPTCHA, or
  cookie tools.

## Before Launch

- Configure deployment environment variables.
- Configure the production domain.
- Deploy Studio independently with `npm run studio:deploy` or a static host
  rooted at `studio/`.
- Add the production web origin to Sanity CORS with credentials, configure both
  preview-origin variables as HTTPS origins without paths, and redeploy both
  applications.
- Confirm changed routes, env vars, asset sources, Sanity changes, forms, analytics events, tests run, responsive QA, and known gaps are documented in the handoff.
- Run `npm run verify` during active development.
- Run `npm run launch:check` after production env vars and client fallback
  content are configured.
- Run `npm run verify:handoff` for client-site handoff when Playwright is ready.
- Install the Playwright browser once with `npm run playwright:install` on a new
  machine.
- Run `npm run verify:release` for performance-sensitive launches after the
  handoff gate is ready.
- Search for placeholder copy and unfinished TODOs.
- Confirm `/privacy` is updated from the starter baseline and linked from the
  footer and contact form.
- Confirm sitemap, robots, OpenGraph image, metadata, forms, analytics, and responsive layouts.

## Template Repo

For the starter itself, enable GitHub template mode in repository settings:

- Repository settings.
- General.
- Template repository.
- Check the box.
