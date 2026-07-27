# Fufu Studio Website

Interim Fufu Studio website built on the current Fufu house starter.

## Agent Entry

Read [AGENTS.md](./AGENTS.md), then use:

- [docs/new-project-checklist.md](./docs/new-project-checklist.md) for template setup.
- [docs/design-to-site.md](./docs/design-to-site.md) for design-file builds.
- [docs/project-brief.template.md](./docs/project-brief.template.md) for intake.
- [docs/client-build-plan.template.md](./docs/client-build-plan.template.md) for the live build checklist.
- [docs/security.md](./docs/security.md) for security, privacy, and consent checks.

## Application Shape

The web app ships with `/`, `/privacy`, `/api/contact`, and metadata routes.
Without Sanity credentials it uses the local Fufu content baseline. Once
Sanity is configured, `siteSettings` and the `home` page become required and
CMS failures surface instead of silently publishing fallback content. The
homepage remains deliberately sparse until the redesign is ready, while its
contact form retains Resend delivery and shared Upstash rate limiting. Contact
submissions flow through a provider-neutral inquiry processor with retry-safe
correlation IDs. When Attio is configured, the form upserts the person, updates
the `Inbound leads` list, and stores the full inquiry as a note; Resend remains
the notification layer.

Vercel Analytics is enabled by default and canonical business events are
dispatched through `src/analytics`. Optional GA4 uses
`NEXT_PUBLIC_GA_MEASUREMENT_ID`; `NEXT_PUBLIC_GA_CONSENT_MODE=basic` blocks
Google until the visitor opts in. See
[docs/forms-analytics.md](./docs/forms-analytics.md) for configuration,
consent, event, and Attio operating guidance.

Sanity Studio is a separate application in `studio/`. Install and run the two
apps independently. Its Presentation tool can load the Next.js site with live
draft content and click-to-edit overlays when the optional preview environment
variables are configured:

```bash
npm install
npm --prefix studio install
npm run dev
npm run studio:dev
```

## Styling

The website uses native CSS and colocated CSS Modules; Tailwind is not part of
the baseline. Shared design decisions live as semantic custom properties in
`src/styles/globals.css`, while component and page modules own local structure and
states. Use the low-level `Heading` and `Eyebrow` primitives for shared heading
and label treatments.

## Verification

Use the full local gate while shaping website changes:

```bash
npm run verify
```

Use the template gate after structural changes so generated files and repository
cleanliness are checked:

```bash
npm run verify:template
```

Use `npm run verify:handoff` for client-site handoff after production env vars
and client fallback content are configured.

Use `npm run test:e2e:analytics` for the dedicated GA4 consent browser suite.
