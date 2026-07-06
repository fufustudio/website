# Client Build Plan

- Source brief: `docs/project-brief.md`
- Source design: Claude design archive, `Website.dc.html` and `Design System.dc.html`
- Last updated: 2026-07-06

## Inventory

| Area    | Item                     | Source                    | Status   | Notes                                                                   |
| ------- | ------------------------ | ------------------------- | -------- | ----------------------------------------------------------------------- |
| Route   | `/` one-page site        | Website design            | complete | Hero, ethos, services, about, contact                                   |
| Route   | `/privacy`               | Existing local work       | complete | Keep policy route; no footer link in design                             |
| Brand   | Palette and typography   | Design system             | complete | Instrument fonts, paper/midnight/spectrum tokens                        |
| Content | Homepage fallback        | Website design            | complete | Typed local content, Sanity-ready                                       |
| Sanity  | Service capabilities     | Plan                      | complete | Add capability chips to service docs                                    |
| Motion  | Organic color fields     | Website design            | complete | Canvas soft-body renderer, simplex-noise drift, reduced-motion fallback |
| Form    | Contact form             | Existing starter + design | complete | Add name, restyle, keep Resend/honeypots/analytics                      |
| QA      | Responsive/accessibility | Runbook                   | complete | Desktop, mobile, reduced motion                                         |

## Decisions And Questions

| Type     | Item               | Owner | Status | Resolution                                                              |
| -------- | ------------------ | ----- | ------ | ----------------------------------------------------------------------- |
| Decision | Portrait assets    | User  | closed | Use placeholders; WebP files are spectrum references                    |
| Decision | Motion approach    | Codex | closed | Canvas 2D soft-body blobs with `simplex-noise`; no PixiJS/Matter/Motion |
| Decision | Homepage CMS model | Codex | closed | Typed local fallback plus Sanity services; no page builder              |

## QA And Verification

| Check                     | Target          | Result        | Notes                                                                                             |
| ------------------------- | --------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `npm run verify:quick`    | repo            | pass          | Components, lint, typecheck, unit tests                                                           |
| `npm run verify:template` | repo            | expected stop | Regenerates CSS/Sanity output, then `check:generated` requires committing changed generated files |
| Template remainder        | repo            | pass          | `template:clean`, component validation, format, lint, typecheck, unit tests, production build     |
| Browser desktop           | `/`             | pass          | Direct Playwright at `http://localhost:3001`                                                      |
| Browser mobile            | `/`             | pass          | No horizontal overflow at 390px wide                                                              |
| Accessibility             | `/`, `/privacy` | pass          | Axe checks found no violations                                                                    |
| Reduced motion            | `/`             | pass          | Cursor hidden; organic field does not animate                                                     |

## Handoff Notes

- Changed routes: `/`, `/privacy`
- Removed starter routes: none
- Sanity changes: service documents gain capability chips
- Env vars changed: none
- Forms/integrations: contact form still uses Resend and `hello@fufu.studio`
- Assets requiring follow-up: real Sarah/Danny portrait images
- Browser/responsive QA: passed on local dev server at `http://localhost:3001`
- Verification: quick gate and production build pass; full template gate stops only because generated files need to be included in the commit
- Known gaps: stock `npm run test:e2e` was not run because port 3000 is occupied by another local Next app, and the Playwright config would reuse that server
