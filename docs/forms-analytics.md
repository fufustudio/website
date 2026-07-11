# Forms And Analytics

The contact form is a minimal reusable provider pattern at
`src/app/(site)/(home)/components/contact-form/index.tsx`. The starter exposes it on `/`
without adding a standalone public `/contact` route.

## Form Behavior

- Validates name, email, and message.
- Includes local honeypot fields.
- Caps submitted field lengths before calling the provider.
- Requires JSON and enforces a 16 KB streamed request-body limit before parsing.
- Submits through the same-origin `/api/contact` route.
- Requires `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_TO_EMAIL` for
  production message delivery.
- Uses Upstash Redis for a shared five-requests-per-ten-minutes rate limit,
  keyed by a one-way hash of the client address.
- Requires either `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`, or Vercel Marketplace's `KV_REST_API_URL` and
  `KV_REST_API_TOKEN`, in production. The route fails closed when either value
  or a trusted client IP header is unavailable.
- Shows explicit success and error states.
- Links to `/privacy` before submission so visitors can review the baseline
  policy.
- Tracks `inquiry_submitted` after successful human submission.

`src/app/api/contact/route.ts` owns the HTTP boundary. Its colocated `lib`
folder owns the browser-safe request contract, validation, email rendering, and
Resend delivery. The site form imports that contract so both sides validate the
same shape without making API code depend on frontend feature code.

Resend requires an API key and a verified sending domain before production
delivery beyond test-mode limitations. Provider delivery is capped at ten
seconds so a slow provider does not hold the route open indefinitely.

The limiter runs before the request body is read and returns `429` with
`Retry-After` when the budget is exhausted. It intentionally allows requests
without Redis configuration in development and tests so starter verification is
network-independent. Production fails closed instead. Provider quota alerts and
hosting/WAF rules are still recommended for defense in depth.

Replace the provider when a project needs server actions, a CRM, a different
transactional email provider, or authenticated workflows.
See `docs/security.md` for provider abuse controls and launch privacy guidance.
Any new provider that touches visitor data must also be reflected in
`/privacy`.

## Analytics

Vercel Analytics and Speed Insights are mounted from
`src/components/layout/site-scripts/index.tsx`, which is rendered by the web root
layout. Studio is a separate application and does not load these scripts. Google Analytics 4 is enabled from that script boundary only when
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured.

For Google Analytics, paste only the `G-...` Measurement ID from the Google tag
setup flow. Do not paste the full Google `<script>` snippet into the app.

Starter events:

- `primary_cta_click`
- `inquiry_submitted`

Keep analytics calls near the component that fires them. Rename events intentionally when reporting needs change.
Reflect any added analytics, ads, chat, heatmaps, CAPTCHA, newsletter, or CRM
tools in `/privacy` before launch. Run `npm run launch:check` before client
handoff to catch missing provider disclosures and starter placeholders.
