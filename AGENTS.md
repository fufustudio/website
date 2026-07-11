<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guide

Canonical instructions for Codex, Claude Code, and other coding agents working in this repo.

## What This Is

This repository is the Fufu Studio website, reset onto the current
`fufu-starter` architecture while its next visual direction is being designed.
It should preserve the starter's structure, verification, and data boundaries
without reintroducing the retired site design.

The interim web app is intentionally small: `/`, `/privacy`, `/api/contact`,
and metadata routes. Sanity Studio is a separate app in `studio/`. Keep the
homepage sparse until a new design and approved content replace the interim
shell.

## Design-To-Site Workflow

When building from a Figma file, Claude design file, screenshot, or design brief:

- Use `docs/design-to-site.md` as the canonical process runbook.
- Snapshot intake into `docs/project-brief.md` before making product decisions that cannot be inferred from the repo or design.
- Create and maintain `docs/client-build-plan.md` or `.agent/client-build-plan.md` before major edits.
- Prefer Figma MCP frame or layer links; record assumptions when working from screenshots.
- Treat design copy as authoritative and Sanity as the client-build content baseline. Keep local fallbacks only so development and CI work before credentials are configured.
- Push real client copy and images to Sanity once schemas and credentials are available. Remove project-specific local image/content fallbacks after the live dataset is seeded so Sanity is the clear source of truth.
- Replace unused starter examples with project-specific routes and content.
- Verify desktop and mobile behavior before handoff, then report changed routes, env vars, assets, Sanity changes, tests run, browser QA, and known gaps.

## Commands

- `npm run dev` - start the dev server at http://localhost:3000.
- `npm run studio:dev` - start standalone Sanity Studio at http://localhost:3333.
- `npm run verify:quick` - fast edit loop: component structure, lint, typecheck, and unit tests.
- `npm run verify` - full local gate: format check, generated CSS/Sanity types, component structure, lint, typecheck, unit tests, and build.
- `npm run verify:template` - full starter handoff path without live CMS credentials.
- `npm run launch:check` - strict client-launch guard for env vars, runtime placeholders, and provider disclosures.
- `npm run verify:handoff` - client-site final gate: full verification, Studio build, generated-file check, launch check, and Playwright e2e.
- `npm run verify:release` - client handoff gate plus Lighthouse CI.
- `npm run template:clean` - starter-only check for forbidden old client strings.
- `npm run typecheck` - run Next route type generation and TypeScript.
- `npm run typegen` - generate Sanity schema/query types.
- `npm run css-types` - generate CSS Module declarations.
- `npm run check:generated-clean` - fail when generated output differs from committed files.
- `npm run test` - run unit tests.
- `npm run test:e2e` - run Playwright smoke/accessibility checks against the current production build.
- `npm run verify:content` - live Sanity content validation after a client project configures Sanity.
- `npm run studio:build` - build the standalone Studio without building Next.js.
- `npm run studio:deploy` - deploy Studio with Sanity-managed hosting.

Use Node.js 22 and npm 10, matching `package.json`, `.node-version`, and CI.

## When To Read More

| Change area                                                      | Read first                                        |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| New repo setup                                                   | `docs/new-project-checklist.md`                   |
| Website from a design file or brief                              | `docs/design-to-site.md`                          |
| Required project/design inputs                                   | `docs/project-brief.template.md`                  |
| Long-running client build checklist                              | `docs/client-build-plan.template.md`              |
| Choosing existing components and shared-vs-local boundaries      | `docs/component-registry.md`                      |
| Pattern recipe APIs, section props, optional UI libraries        | `docs/pattern-library.md`                         |
| Architecture, data boundaries, route ownership                   | `docs/architecture.md`                            |
| Visual layout, spacing, typography, buttons, responsive behavior | `docs/design-system.md`                           |
| Sanity schemas, seed data, content validation                    | `docs/cms.md`                                     |
| Forms, analytics events, conversion tracking                     | `docs/forms-analytics.md`                         |
| Security, privacy, CSP, cookies, secrets, abuse controls         | `docs/security.md`                                |
| Images, loading behavior, Lighthouse, Core Web Vitals            | `docs/performance.md`                             |
| Deployment and launch checks                                     | `docs/launch.md`                                  |
| Template customization and final starter cleanup                 | `docs/template-customization.md`                  |
| Next.js APIs, routing, config, metadata, typed routes            | Local Next docs in `node_modules/next/dist/docs/` |

## Project Rules

- Pages compose content, data helpers, and reusable components. They should stay thin.
- Every reusable React component lives in its own kebab-case folder, such as
  `src/components/ui/button/index.tsx`, with a colocated `styles.module.css` when
  local styles are needed. Shared non-React type modules may stay at the category level.
- Route-local implementation under `src/app` may use plain `components` and
  `lib` folders; without a `page` or `route` file they do not expose a URL.
- `src/components/ui` owns low-level primitives. The sibling
  `layout` folder owns reusable page-section layouts and shared site chrome.
  Page-specific composition starts in the route's own `components` folder and
  moves upward only after another route needs it.
- Route-local React components follow the same colocation rule: each component
  uses a kebab-case folder with `index.tsx` and an optional `styles.module.css`.
  Reserve a `features` layer for substantial behavior shared across routes.
- `src/data` owns site-only data access, GROQ queries,
  generated-query result normalization, and local fallback selection.
  `src/sanity` owns shared web integration infrastructure; `studio` owns schemas
  and authoring structure.
- `globals.css` owns the native reset, shared `:root` design tokens, grid
  helpers, and truly cross-page utilities. CSS Modules consume those tokens and
  own component-specific selectors.
- Styling uses native CSS and CSS Modules. Do not add Tailwind or utility-class
  styling to the website baseline.
- Component-only selectors belong in CSS Modules.
- Do not add hard-coded brand colors in component or route CSS Modules. Promote
  reusable values to theme tokens in `globals.css`.
- Use `Heading`, `Eyebrow`, `Section`, `Container`, `PageHeader`,
  `SectionHeading`, `TextLink`, `Button`, `ButtonLink`, `ActionGroup`, and
  section recipes before creating new layout, typography, or button patterns.
- Keep interim text and examples minimal. Prefer typed extension points over placeholder content.
- Client builds use Sanity by default. Keep local fallbacks so default local dev and CI still work before live Sanity credentials are configured.
- Keep `.env.example`, README, and docs in sync when adding configuration.
- Run `npm run verify:template` after structural or generated-file changes.
- Run `npm run verify:handoff` before client-site launch handoff after
  production env vars and fallback content are configured.

## Sanity

Standalone Studio config and schema live in `studio/`. The web app keeps only its
Sanity client, live integration, and generated-type bridge under `src/sanity/`.
Site-specific queries live beside their consumers in `src/data/queries/`.

Current baseline model:

- Singleton: `siteSettings`
- Repeatable: `page`, `service`

Use `defineType`, `defineField`, and `defineArrayMember`. Let Sanity generate IDs for repeatable documents. Explicit IDs are reserved for true singletons such as `siteSettings`.

## Forms And Analytics

The contact form lives beside the homepage in
`src/app/(site)/(home)/components/contact-form/`; its browser-safe request
contract lives in `src/contracts/contact.ts`, while server-only delivery behavior
lives with `src/app/api/contact/`.
The client form validates name, email, and message fields, validates email shape,
includes honeypots, submits through the Resend route when configured, and tracks
successful human submissions with `inquiry_submitted`.

Vercel Analytics events should stay close to the interaction surface that fires them.

## Do Not

- Do not reintroduce the retired Fufu marketing copy, portraits, motion system,
  or design-specific components.
- Do not add broad fake content just to make the starter look full.
- Do not bypass generated-file checks after changing CSS modules or Sanity schemas.
- Do not make live CMS credentials required for default CI.
- Do not remove accessibility labels, focus states, alt text, or reduced-motion handling while restyling.
