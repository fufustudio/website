# Architecture

This repository contains two independently runnable applications: the Next.js
website at the repository root and Sanity Studio in `studio/`. The web app keeps
local fallbacks so development and CI do not require live CMS credentials.

## Mental Model

- `src/app` answers: **Which URLs and application sections exist?** Route files stay thin.
- Route-local `components` folders answer: **What UI belongs only to this route?**
- `src/components` answers: **Which UI building blocks are reusable?**
- `src/content` answers: **Which credential-free fallback copy is available?**
- `src/data` answers: **Which normalized, UI-safe content does the site need?**
- `src/config` answers: **Which runtime, SEO, image, font, and theme settings are shared?**
- `src/sanity` answers: **How does the application connect to Sanity?**
- `src/config` contains runtime-wide configuration shared by the site and APIs.
- `src/contracts` contains pure browser/server interfaces shared across boundaries.
- `studio` owns the authoring application, schemas, structure, and CMS scripts.

Start page composition beside its route. Add a feature layer only when substantial
domain behavior is genuinely shared across routes. Do not add empty `services`,
`work`, `about`, or proposal domains before the redesign requires them.

## Route Map

```text
src/app/
├── favicon.ico                # global browser icon; required at app root
├── global-error.tsx           # last-resort application error UI
├── global-not-found.tsx       # unmatched URL fallback with complete HTML
├── robots.ts                  # /robots.txt
├── sitemap.ts                 # /sitemap.xml
├── (site)/
│   ├── layout.tsx              # root HTML and shared site chrome
│   ├── error.tsx               # recoverable site error boundary
│   ├── (home)/
│   │   ├── page.tsx            # /; metadata and data-loading boundary
│   │   └── components/         # homepage-only composition and form
│   ├── not-found.tsx           # site not-found UI
│   └── privacy/
│       ├── page.tsx            # /privacy
│       └── components/         # privacy-only composition
├── api/contact/
│   ├── route.ts                # POST /api/contact
│   └── lib/                    # server-only parsing and delivery helpers
├── api/draft-mode/
│   ├── enable/route.ts         # authenticated Sanity preview entry
│   └── disable/route.ts        # clear preview state
```

`src/instrumentation.ts` owns the server request-error reporting hook.

API Route Handlers do not render through the site layout. The `(site)` route
group gives all public rendering code one ownership boundary without adding a
URL segment. Route-local `components` folders are safe to colocate there:
Next.js exposes a route only when a segment contains `page` or `route`.

## Source Shape

```text
src/
├── app/                        # route sections and colocated implementation
│   ├── (site)/                 # all public-site rendering code
│   └── api/                    # route handlers and their helpers
├── components/                 # shared UI, section recipes, and site chrome
├── config/                     # Next/runtime-wide configuration
├── content/                    # credential-free fallback content
├── contracts/                  # pure browser/server request contracts
├── data/                       # site queries, normalization, and fallback selection
├── sanity/                     # shared client, live integration, type bridge

studio/
├── sanity.config.ts
├── sanity.cli.ts
├── schemaTypes/
├── structure.ts
└── scripts/
```

## Ownership Rules

- Pages own routing, metadata, data loading, redirects, and not-found decisions,
  then pass normalized values into route-local page components.
- Page-specific composition and behavior stay in the route's `components`
  folder. Promote code to shared site components only when multiple routes need it.
- Introduce a feature layer only for substantial cross-route domain behavior.
- UI primitives own reusable controls and layout atoms.
- Layout components own repeated page-section composition and shared site chrome.
- Every shared React component lives in its own kebab-case folder with
  `index.tsx` and, when needed, `styles.module.css`.
- Data helpers return normalized, UI-safe values. They choose local fallbacks
  only while Sanity is unconfigured; configured CMS errors must surface.
- Site data modules own their GROQ and normalized content reads; shared Sanity
  modules own connection and live-preview infrastructure. Studio owns content modeling.
- Config files own constants, not runtime fetching or behavior.

## Data Flow

1. A route loads normalized content through a server-only helper in
   `src/data`.
2. The route passes that content into its route-local page component.
3. The data helper executes a colocated typed query from
   `src/data/queries` through
   `sanityFetch` when Sanity is configured and normalizes the generated query
   result. `sanityFetch` selects published or draft content from Next.js Draft
   Mode and registers the query for Sanity Live cache invalidation. It returns local
   content from `src/content` only when Sanity is unconfigured. A configured
   project with failed queries or missing required baseline documents fails
   visibly instead of treating starter content as a successful CMS response.
4. Route-local and shared components receive only the values they need.

Cache Components is enabled. Published Sanity reads use the shared cache-life
profile, while Draft Mode and perspective selection stay outside cached
functions. Do not access request APIs from a `"use cache"` scope.

`getSiteSettings()` is the normalized identity authority for rendered chrome.
`getCleanSiteSettings()` performs the same query with Stega disabled for
metadata and JSON-LD. The local
`src/content/site.ts` value supplies the same shape before credentials exist;
configured builds use the Sanity singleton.

TypeGen runs from `studio/sanity.cli.ts`, scans queries in `../src`, and writes
the committed web types to `sanity.types.ts` at the repository root.
