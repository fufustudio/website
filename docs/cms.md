# Sanity CMS

Sanity is the baseline CMS for client builds. The starter still keeps local
fallbacks so default local development and CI can run before live Sanity
credentials are configured. Those fallbacks are not an error-recovery path:
after `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, failed queries and missing
required baseline documents fail the build or request instead of silently
showing starter content.

## Documents

- `siteSettings` - singleton for shared site facts.
- `page` - repeatable generic page content.
- `service` - repeatable offering or feature content.

Add a `post` or article document type only when a client project actually ships
public editorial routes, archive pages, metadata, and validation for that
content.

## Rules

- Use `defineType`, `defineField`, and `defineArrayMember`.
- Let Sanity generate IDs for repeatable documents.
- Use explicit IDs only for true singletons such as `siteSettings`.
- Keep fields semantic. Avoid layout knobs unless the project intentionally needs editor-controlled layout.
- Keep GROQ queries static and parseable by Sanity TypeGen.
- Reference browser-exposed environment values with direct `process.env.NAME`
  access. Dynamic lookups like `process.env[name]` are not inlined by Next or
  Vite and can leave browser code on placeholder values.

## Studio Architecture

The repository has two package boundaries. The Next.js web app remains at the
repository root, while Studio lives in `studio/` and runs on Sanity's Vite-based
toolchain:

```text
project/
├── src/       # Next.js frontend source
├── package.json
└── studio/    # standalone Sanity Studio package
```

Deploy Studio with Sanity-managed hosting or as its own static web application.
The web app has no `/studio` route. Each application has its own dependencies,
lockfile, environment file, build, and deployment lifecycle.

## Setup

```bash
cp .env.example .env.local
cp studio/.env.example studio/.env.local
npm install
npm --prefix studio install
```

Configure the web app with public read settings:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-06-24
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333
```

Configure Studio with the same project and dataset:

```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_API_VERSION=2026-06-24
SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000
```

Then authenticate and add the web development origins:

```bash
cd studio
npx sanity login
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add http://localhost:3001 --credentials
cd ..
```

Run the apps in separate terminals:

```bash
npm run dev
npm run studio:dev
```

Restart the relevant development server after changing either env file. The web
app defaults to `http://localhost:3000`; Studio defaults to
`http://localhost:3333`. If Studio asks to connect its localhost origin, approve
that development host.

## Presentation, Draft Mode, And Live Content

The starter includes Sanity's complete optional editing path:

- `sanityFetch` serves published content normally and draft content when
  Next.js Draft Mode is active.
- `SanityLive` registers configured queries for live cache invalidation.
- Studio's Presentation tool loads the real web app, updates draft content as
  editors type, and supplies click-to-edit overlays.
- Metadata and JSON-LD use a Stega-disabled fetch, and Draft Mode responses are
  marked `noindex`.

Create a Sanity API token with the Viewer role and add it only to the web app:

```env
SANITY_API_READ_TOKEN=your-viewer-token
```

Never use a write-capable token and never prefix this variable with
`NEXT_PUBLIC_`. `next-sanity` makes the Viewer token available to its browser
subscription only during an authenticated Presentation/Draft Mode session.

The two application origins point in opposite directions:

- `NEXT_PUBLIC_SANITY_STUDIO_URL` tells the web app which Studio should receive
  click-to-edit intents and which origin may frame the site.
- `SANITY_STUDIO_PREVIEW_ORIGIN` tells the standalone Studio which web app to
  load in Presentation.

Use localhost values during development and HTTPS origins without paths in
deployed environments. Add every frontend origin used by Presentation to the
Sanity project's CORS list with credentials enabled. Restart both processes
after changing their environment files.

Presentation currently maps the `home` page and `siteSettings` to `/`. Add a
resolver only when its corresponding frontend route exists; the prepared
`service` schema intentionally has no location yet.

To rotate preview access, create a new Viewer token, update the web deployment,
redeploy, verify Presentation, and then revoke the old token in Sanity Manage.
If Presentation is blank, check the frame-ancestor CSP, both origin variables,
and CORS. A 503 from `/api/draft-mode/enable` means the Viewer token is absent;
401/403 responses usually indicate an invalid token, preview secret, or CORS
configuration.

## TypeGen

`studio/sanity.cli.ts` extracts the Studio schema, scans GROQ queries in
`../src`, and writes `../sanity.types.ts` for the web app. Run it from the
repository root:

```bash
npm run typegen
```

TypeGen also runs during the normal verification path. Commit both
`studio/schema.json` and `sanity.types.ts`.

## Images And Source Of Truth

- Upload client content images to Sanity using `imageWithAlt` fields with
  hotspot enabled. Do not keep duplicate `public/` images as the source of
  truth for editable client content.
- Query `asset->{url, metadata{lqip, dimensions}}`, plus `crop` and `hotspot`,
  for images rendered by the app.
- Render content images through `ImageFrame` or `BackgroundImageLayer` and set
  `sizes` to the actual responsive slot so the Sanity loader requests the
  correct width.
- After live Sanity content is seeded, remove project-specific local image
  fallbacks. Keep only the generic no-credential fallback content needed for
  default local development and CI.

## Seed And Validation

```bash
SANITY_DRY_RUN=1 npm run sanity:seed
npm run sanity:seed
npm run verify:content
```

`SANITY_DRY_RUN=1 npm run sanity:seed` is a no-network preview of the writes the
script would make. It should work without Sanity project access.

The default seed creates `siteSettings` and the `home` page only when they are
missing, so rerunning setup does not overwrite authored content. Other
repeatable documents are not seeded in the reusable starter.

To intentionally reset `siteSettings` to the local fallback values, use the
destructive command `npm run sanity:seed:force`. The home page remains
create-if-missing even during a forced singleton reset.

Both baseline documents are required once the web app is connected to Sanity.
Run the seed or create equivalent documents before verifying a configured
build. Leaving the project ID unset is the supported credential-free mode.

If Studio reports missing array keys after API-created content:

```bash
npm run sanity:repair-keys
npm run sanity:repair-keys:apply
```

The first command is always a dry run. Review the listed document IDs before
using the explicit apply command. Applied patches use Sanity revision guards so
concurrent editorial changes are not overwritten.

## Production Sanity Path

Default local development and CI must still work without live CMS credentials.
For production-grade authoring:

- Deploy Studio independently with `npm run studio:deploy`, or configure a
  separate static-hosting project rooted at `studio/`.
- Add local, preview, and production app URLs to Sanity CORS origins with
  credentials enabled.
- Add `SANITY_API_READ_TOKEN` to enable draft content and Visual Editing. Use a
  Viewer token and rotate it if it is exposed.
- Add `SANITY_REVALIDATE_SECRET` only when webhooks revalidate paths or tags.
- Keep the included `next-sanity` Live Content, Draft Mode, and Presentation
  wiring intact. It stays dormant when the web project ID and preview token are
  absent.
- Keep metadata and static params clean of draft/Stega data. Disable Stega for
  SEO queries and fetch published content for static params.
- Include `_key` in array projections and use `_key` as React keys for arrays
  that may be edited visually.
- Do not catch configured Sanity failures and replace them with local content.
  Let Next.js retain the last successful cached result or report the failure;
  otherwise starter content can be cached as if it were a valid CMS refresh.
- Add a Sync Tag Invalidate Function only when every public visitor must see a
  publication immediately. The starter uses `next-sanity` v13's lighter
  stale-while-revalidate behavior by default.

Do not make live credentials required for the starter's default verification
commands.
