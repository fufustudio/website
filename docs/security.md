# Security And Privacy

This starter is built for basic marketing sites with optional Sanity content
and an optional contact form. Keep the default site small, public, and
low-sensitivity; add project-specific controls when a client site collects more
data, adds authenticated features, or connects to business-critical systems.

## Starter Security Baseline

- Security headers are configured in `next.config.ts`, including
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, a public
  Content Security Policy, and production-only HSTS. Framing is controlled by
  CSP `frame-ancestors`: only the same origin and the explicitly configured
  Sanity Studio origin are allowed. Do not add `X-Frame-Options`, which would
  conflict with the standalone Studio Presentation iframe.
- The baseline HSTS policy applies to the current host only. Enable
  `includeSubDomains` and browser preload only after confirming every client
  subdomain is permanently HTTPS-ready.
- The public CSP allows the known starter integrations: Sanity, Vercel
  Analytics, Vercel Speed Insights, optional Google Analytics, and
  Google-hosted fonts. Add provider origins only when a project actually uses
  them.
- Sanity content is fetched through a small data helper with local fallbacks so
  default local development and CI do not require live credentials. Once a
  Sanity project is configured, CMS errors surface rather than being replaced
  by content that could make a broken integration look healthy.
- `NEXT_PUBLIC_SANITY_PROJECT_ID` identifies the public Sanity project; never
  place a private read or write token in a `NEXT_PUBLIC_*` variable.
- Sanity Studio is a separate application under `studio/`; the public Next.js
  deployment does not expose a `/studio` route or Studio-specific CSP surface.
- Studio schema validation restricts rich-text and CTA links to `http`, `https`,
  `mailto`, `tel`, or relative URLs. The frontend Portable Text renderer also
  blocks unsupported protocols before rendering anchors.
- JSON-LD is emitted with `<` escaped before injection.
- The contact form validates required fields, validates email shape, includes
  honeypot fields, caps field lengths, and only sends through the server-side
  contact route when Resend is configured. The route applies an Upstash-backed
  shared rate limit before reading the body and times out slow provider calls.
- Analytics events are fired near the interaction surfaces that trigger them.
  Avoid putting personal data, message contents, email addresses, tokens, or
  customer IDs in analytics event names, paths, or custom properties.

## Contact Form Abuse

The starter Resend pattern posts from the browser to the same-origin
`/api/contact` route. Resend credentials must stay server-only:
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_TO_EMAIL`.
The rate limiter also requires either server-only `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` values or Vercel Marketplace's `KV_REST_API_URL`
and `KV_REST_API_TOKEN` values in production.

Before launch:

- Add and verify the sending domain in Resend, then use that domain in
  `RESEND_FROM_EMAIL`.
- Enable provider-side spam filtering and domain restrictions when the provider
  supports them.
- Keep the honeypot fields and client-side validation intact.
- Keep field length limits on all submitted values.
- Keep the route's JSON content-type and streamed request-size checks intact.
- Keep the Upstash shared-store rate limiter enabled and consider an additional
  hosting/WAF rule for defense in depth. Do not replace it with per-process
  memory in serverless deployments.
- Consider Turnstile, hCaptcha, rate limiting, or stronger server-side controls
  when spam volume, CRM writes, transactional email, or authenticated workflows
  are involved.
- Treat submitted messages as untrusted text in inboxes, CRMs, automations, and
  dashboards.

## Privacy Policy Requirement

The starter ships a generic `/privacy` baseline. Review and update it before
launching a real client site with the contact form, analytics, or any provider
that touches visitor data. The policy should explain, in plain language:

- What the site collects, such as name, email, message content, basic analytics,
  and hosting logs.
- Why the data is collected, such as responding to inquiries, maintaining the
  site, measuring aggregate usage, or preventing abuse.
- Which service providers process the data, such as the hosting platform, form
  provider, CMS, analytics provider, email provider, or CRM.
- How long inquiry data is retained.
- How a visitor can request access, correction, or deletion when applicable.
- Whether submitted leads may be used for sales follow-up or marketing email.

Before launch, fill in the legal or business name, public privacy contact
email, effective date, actual analytics tools, email provider or inbox, whether
Resend is used, whether Sanity stores only public content or also stores leads,
and any CRM, newsletter, advertising, chat, heatmap, CAPTCHA, cookie, or
embedded media provider. Any new provider that touches visitor data must be
reflected in `/privacy`.

Do not promise security, retention, deletion, or data-sharing practices that the
client cannot actually honor operationally.

## Cookie And Consent Note

A cookie banner is not automatically required for every small marketing site.
This starter uses Vercel Analytics and Speed Insights, which are intended to be
privacy-preserving and do not rely on third-party advertising cookies. It can
also enable Google Analytics when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured.
Analytics should be disclosed in the privacy policy.

Revisit cookie consent before launch whenever a project adds:

- Google Analytics or other analytics that set non-essential cookies or local
  storage. Google Analytics may introduce cookies or similar storage depending
  on property settings, consent mode, and regional requirements.
- Ad pixels, retargeting, affiliate tracking, or cross-site profiling.
- Heatmaps, session replay, chat widgets, embedded media, or social plugins that
  track visitors.
- Region-specific targeting for visitors in jurisdictions with opt-in consent
  rules for non-essential storage or tracking.

If non-essential cookies or similar browser storage are added, load them only
after the required consent for the target jurisdictions and provide an easy way
to withdraw that consent.

## CMS And Environment Boundaries

- Keep Sanity CORS origins limited to local development, preview deployments,
  and production domains that need access.
- Never expose Sanity read/write tokens through `NEXT_PUBLIC_*` variables.
- Use a Viewer-only `SANITY_API_READ_TOKEN` for draft preview and Visual
  Editing. `next-sanity` shares it with the browser only inside an authenticated
  Draft Mode session; never reuse a write token for this purpose.
- Keep `NEXT_PUBLIC_SANITY_STUDIO_URL` restricted to the one trusted Studio
  origin. It controls both click-to-edit links and the CSP frame allowlist.
- Keep published public content separate from draft or stega-enriched preview
  content in metadata, static params, sitemaps, and feeds.
- Keep the Draft Mode enable route protected by Sanity's preview-secret
  handshake. Draft responses must remain private, uncached, and `noindex`.

## Launch Security Checklist

- Run `npm run verify:handoff` before client handoff.
- Review `npm audit --omit=dev` and update framework/CMS packages when a safe
  non-breaking fix is available.
- Confirm the standalone Studio deployment uses the intended project, dataset,
  access roles, and approved origins.
- Keep web and Studio Sanity project, dataset, and API version values aligned.
  `launch:check` compares them when both are configured. Use
  `SANITY_ALLOW_CONFIG_MISMATCH=true` only when a deliberate multi-dataset or
  multi-project architecture has been documented.
- Confirm contact form abuse controls are enabled at the provider or server
  layer.
- Confirm `/privacy` has a current effective date and matches the actual
  providers and data flows.
- Confirm whether cookie consent is required for the analytics, advertising,
  embeds, and tracking tools used by the client project.
- Run `npm run launch:check` before client handoff so placeholder env vars,
  runtime starter copy, Sanity configuration drift, and provider disclosure
  drift are caught. The runtime scan covers JavaScript and TypeScript throughout
  `src`; docs and test fixtures are intentionally outside that launch scan.
  Add visitor-facing provider names to `scripts/provider-registry.mjs` when a
  baseline integration is added so public policy and setup docs remain separate
  enforced contracts.
