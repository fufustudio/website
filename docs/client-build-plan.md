# Client Build Plan

- Source brief: `docs/project-brief.md`
- Source architecture: sibling `fufu-starter` through commits `fb796e6` and
  `1e6dffd`, plus its active editor-formatting setup
- Source design: TBD
- Last updated: 2026-07-10

## Inventory

| Area         | Item                              | Status   | Notes                                                         |
| ------------ | --------------------------------- | -------- | ------------------------------------------------------------- |
| Structure    | Current starter web architecture  | complete | Thin App Router with top-level page modules and components    |
| Studio       | Standalone top-level Sanity app   | complete | Independent package, env, build, and deploy                   |
| Homepage     | Hero, flexible body, contact      | complete | Minimal interim Fufu content only                             |
| Components   | Generic UI and layout recipes     | complete | Reusable primitives and section recipes preserved             |
| Styling      | Native CSS baseline               | complete | Root tokens, native reset, CSS Modules, and text primitives   |
| Cleanup      | Retired Fufu design and content   | complete | Portraits, motion, bespoke interactions, and old copy removed |
| Contact      | Resend plus Upstash path          | complete | Shared validation and accessible form states                  |
| Privacy      | Provider-aware Fufu policy        | complete | Disclosures aligned with configured providers                 |
| Verification | Root and Studio gates             | complete | Generated files, unit tests, builds, and browser QA           |
| Starter sync | Latest shared starter conventions | complete | Styling, DOM tests, verification, CI, and Sanity safety       |

## Decisions

| Item                    | Resolution                                                                    |
| ----------------------- | ----------------------------------------------------------------------------- |
| Interim visual baseline | Use the neutral starter theme and generic component styles until redesign     |
| Existing Sanity data    | Preserve without destructive migration; obsolete fields become unexposed      |
| Public routes           | Keep `/` and `/privacy`; remove embedded `/studio`                            |
| Studio deployment       | Configure later through independent Studio environment and deploy commands    |
| Styling architecture    | No Tailwind; shared decisions use root tokens and local selectors use modules |

## QA And Verification

| Check                     | Result        | Notes                                                                                       |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `npm run verify:quick`    | pass          | Component structure, lint, typecheck, and unit tests                                        |
| `npm run verify`          | pass          | 17 test files, 65 tests, generated types, lint, typecheck, and production build             |
| `npm run verify:template` | expected stop | Working and Studio gates pass; generated-file cleanliness requires committing this refactor |
| `npm run studio:build`    | pass          | Standalone Studio production build                                                          |
| Browser desktop/mobile    | pass          | 21 Playwright checks passed; one desktop-only mobile-nav skip                               |
| Accessibility             | pass          | Axe found no violations on `/` or `/privacy` at desktop and mobile sizes                    |
| Configured Sanity build   | pass          | Existing CMS project read without dataset writes                                            |
| Credential-free build     | pass          | Local Fufu fallback rendered with Sanity variables empty                                    |
| Preview-token build       | pass          | Draft Mode boundary compiled with a Viewer-token-shaped value                               |

## Handoff Notes

- Changed routes: `/`, `/privacy`, `/api/contact`, Draft Mode, metadata, and error routes.
- Removed route: embedded `/studio`.
- Sanity: standalone Studio; baseline `siteSettings`, `page`, and `service` schemas.
- Live dataset: no writes, deletes, or destructive migrations.
- Assets requiring follow-up: all final redesign assets.
- Browser/responsive QA: desktop and Pixel 5 projects pass, including keyboard focus and form states.
- Verification: full local gate, standalone Studio build, configured/fallback
  builds, and Playwright pass.
- Latest starter sync: richer heading/eyebrow APIs, DOM interaction tests,
  simplified verification commands, Next-native env loading, combined provider
  disclosure checks, and revision-guarded Sanity repair tooling.
- Known gap: final visual design, production Studio hostname, and production provider configuration remain TBD.
- Styling baseline: Tailwind and its PostCSS/Prettier plugins are removed;
  shared headings and eyebrows render through low-level primitives.
