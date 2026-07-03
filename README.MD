# fufu-starter

Fufu house starter for fast, consistent Next.js site builds.

## Barebones Launch

This repo is currently configured for a home-only launch:

- `/` renders the Sanity `page` document with slug `home`, falling back to
  `Hello world` / `Powered by Sanity.`
- `/studio` uses Sanity project `8l26et78` and dataset `production`.
- The homepage message form posts to `/api/contact` and sends through Resend to
  `hello@fufu.studio`.

Use a rotated Resend key in `RESEND_API_KEY`; do not reuse any key shared in
chat or commit secrets to the repo.

## Agent Entry

Read [AGENTS.md](./AGENTS.md), then use:

- [docs/new-project-checklist.md](./docs/new-project-checklist.md) for template setup.
- [docs/design-to-site.md](./docs/design-to-site.md) for design-file builds.
- [docs/project-brief.template.md](./docs/project-brief.template.md) for intake.
- [docs/client-build-plan.template.md](./docs/client-build-plan.template.md) for the live build checklist.
- [docs/security.md](./docs/security.md) for security, privacy, and consent checks.

## Handoff

```bash
npm run verify:template
```

Use `npm run verify:handoff` for client-site handoff when Playwright is ready.
