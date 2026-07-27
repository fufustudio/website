# Forms And Analytics

The contact form is a minimal reusable provider pattern at
`src/components/contact-form/index.tsx`. The homepage module exposes it on `/`
without adding a standalone public `/contact` route.

## Form Behavior

- Validates name, email, and message.
- Includes local honeypot fields.
- Caps submitted field lengths before calling the provider.
- Requires JSON and enforces a 16 KB streamed request-body limit before parsing.
- Submits through the same-origin `/api/contact` route.
- Requires `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_TO_EMAIL` for
  production message delivery.
- Uses Attio as the durable CRM capture destination when
  `ATTIO_ACCESS_TOKEN` and `ATTIO_INBOUND_LIST_ID` are configured together.
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
- Assigns each attempted submission a UUID correlation ID. Retrying an
  unchanged failed submission reuses the ID; editing the form starts a new
  attempt.

`src/app/api/contact/route.ts` owns the HTTP boundary.
`src/server/contact` owns server-only parsing, inquiry processing, email
rendering, and provider destinations. `src/contracts/contact.ts` owns the pure browser/server
request contract and validation, so both sides validate the same shape without
making API code depend on frontend feature code.

Resend requires an API key and a verified sending domain before production
delivery beyond test-mode limitations. Attio uses a server-only workspace access
token. Provider calls are capped at ten seconds so a slow provider does not hold
the route open indefinitely. The submission ID is sent as a Resend idempotency
key and included in Attio list metadata and the note title so safe retries do
not send a second notification or add a second inquiry note.

The limiter runs before the request body is read and returns `429` with
`Retry-After` when the budget is exhausted. It intentionally allows requests
without Redis configuration in development and tests so starter verification is
network-independent. Production fails closed instead. Provider quota alerts and
hosting/WAF rules are still recommended for defense in depth.

Replace or extend the provider destinations when a project needs a CRM, a
different transactional email provider, or authenticated workflows.
See `docs/security.md` for provider abuse controls and launch privacy guidance.
Any new provider that touches visitor data must also be reflected in
`/privacy`.

## Inquiry Processing And CRM Extension

The reusable inquiry path deliberately separates the public HTTP contract from
provider work:

```text
contact form
  -> POST /api/contact
  -> rate limit, parse, honeypot, normalize, validate
  -> create InquiryContext
  -> processInquiry
     -> Attio person + Inbound leads entry + message note, when configured
     -> Resend inbox notification
  -> success response
  -> anonymous inquiry_submitted event
```

`InquiryContext` contains only operational metadata: a UUID `submissionId`, a
server timestamp, and fixed form source identifiers. Keep visitor answers in
`ContactInquiry`; do not add provider record IDs, lifecycle stages, or
credentials to the browser-safe contract.

`processInquiry` is the server-only extension point. Without Attio
configuration, successful inbox notification is both capture and notification,
so a Resend failure means the inquiry was not captured. With Attio configured,
Attio capture is required and Resend is secondary: the form returns success
after CRM capture even if the notification fails.

## Attio CRM Setup

The Fufu Studio Attio workspace uses a People-backed list named
`Inbound leads` with an `All leads` table view. Configure these list attributes
with the exact names below so their generated API slugs match the adapter:

| Attribute       | Type      | Values or purpose                                      |
| --------------- | --------- | ------------------------------------------------------ |
| `Status`        | Status    | `New`, `Replied`, `Qualified`, `Closed`; default `New` |
| `Source`        | Text      | Fixed form placement and form ID                       |
| `Interest`      | Text      | Optional visitor interest                              |
| `Submission ID` | Text      | Retry correlation and duplicate detection              |
| `Received at`   | Timestamp | Server receipt time in UTC                             |

Create a workspace access token with only these permissions:

- Records: read-write
- Object Configuration: read
- List Entries: read-write
- List Configuration: read
- Notes: read-write

Then configure both server-only values:

```dotenv
ATTIO_ACCESS_TOKEN=
ATTIO_INBOUND_LIST_ID=
```

The destination upserts a Person by `email_addresses`, updates the one list
entry for that person, and creates a plaintext note containing the complete
message and operational metadata. The list shows the latest inquiry metadata;
notes preserve each distinct submission. A retry with the same submission ID
reuses the list entry and skips an already-created note.

Do not expose the token with a `NEXT_PUBLIC_` prefix. Rotate it in Attio if it is
ever committed, logged, pasted into client code, or otherwise disclosed. Gmail
sync is optional and complementary: it adds later email/calendar activity to
Attio, but it does not replace the direct form capture because the website
notification may be sent by Resend rather than by the visitor.

## Other CRM Destinations

When replacing or extending Attio with another CRM:

1. Add a server-only destination such as
   `src/server/contact/destinations/hubspot-crm.ts`.
2. Upsert the contact using the CRM's supported unique identity.
3. Store the inquiry as an activity, form submission, ticket, or other
   provider-native engagement instead of flattening the message into a contact
   property.
4. Use `InquiryContext.submissionId` as the external deduplication/correlation
   key when the CRM supports it.
5. Make CRM capture the required operation and treat the Resend inbox message
   as a notification.
6. Return form success when durable capture succeeds. If capture succeeds but
   notification fails, log or retry the notification without asking the
   visitor to resubmit.

For high-value or multi-destination inquiry flows, durably enqueue the accepted
inquiry before returning success and process CRM/email work with bounded
retries. Do not add a queue, database, CRM SDK, fake provider setting, or empty
adapter before the project chooses that infrastructure.

Adding a CRM also requires:

- Server-only credentials and explicit configuration validation.
- Unit tests for create, update, duplicate, timeout, and safe-error behavior.
- A provider-registry entry so setup documentation and public disclosure stay
  enforced.
- Updated `/privacy` copy covering purpose, processor, retention, and visitor
  rights.
- A decision about which system owns deletion, suppression, lifecycle stage,
  assignment, and consent.

Permission to respond to an inquiry is not permission to send newsletters or
promotions. Add a separate, unchecked, purpose-specific marketing opt-in only
when a marketing platform and operating process have been selected. Store the
consent wording/version, time, source, and withdrawal state in the system that
owns marketing subscriptions.

## Analytics

The source-owned analytics layer lives in `src/analytics`. Components call one
typed API:

```ts
trackEvent("cta_clicked", {
  cta_id: "foundation",
  placement: "hero",
});
```

`AnalyticsEventMap` in `src/analytics/events.ts` is the canonical event
contract. The event name selects the exact required properties at the call
site. Add a new event to that map first, then add an explicit projection for
each destination. Do not broadcast arbitrary component props or user-entered
values.

The dispatcher creates one canonical event and sends it independently to every
enabled, eligible destination. A destination failure is isolated from the
others and from the visitor interaction. Current projections are:

- Vercel Analytics keeps canonical names and sends no more than two allowlisted,
  flat scalar properties.
- GA4 keeps `cta_clicked` as a custom event.
- GA4 maps canonical `inquiry_submitted` to its recommended `generate_lead`
  event with a fixed `lead_source` and allowlisted form context.

Canonical events:

- `cta_clicked`: `cta_id` plus a typed `placement`.
- `inquiry_submitted`: the fixed contact form ID and homepage placement.

Do not send names, email addresses, messages, the optional interest field,
arbitrary URLs, or other user-entered values. Track form completion only after
the server confirms successful delivery.

`src/components/site-scripts/index.tsx` mounts provider scripts from the
same parsed configuration used by the dispatcher:

- `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED` defaults to `true`. Set it to `false`
  to remove Vercel Analytics automatic pageviews and custom events.
- Vercel Speed Insights remains separate from business-event dispatch.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` enables GA4. Paste only the `G-...`
  Measurement ID, not Google's full script snippet.
- `NEXT_PUBLIC_GA_CONSENT_MODE` defaults to `basic` and accepts only `basic` or
  `immediate`.

Providers retain their own automatic pageview tracking. Do not add manual
route-change pageviews or pageview events to the dispatcher, because that can
double-count visits.

During `next dev`, the dispatcher also sends each canonical event to a
development-only console destination. It renders one colored, collapsed
`ANALYTICS` group with the event name and placement; expanding it shows the
canonical object and a property table. This confirms that the application
emitted the expected event, but it does not claim that Vercel or GA4 received
it. Use Vercel's development logs and GA4 Tag Assistant, DebugView, or network
requests to verify provider delivery. The console destination is excluded from
production builds and requires no package or environment variable.

## Minimal Google Consent

`basic` is the privacy-conservative default. Before Google loads, the root
layout queues a denied consent default for analytics and advertising storage
and disables Google Signals and ad-personalization signals. No Google network
script is mounted and no GA event is sent until the visitor chooses
**Allow analytics**.

The client-only preference store uses `fufu.analytics-consent.v1` in local
storage with a versioned `granted` or `denied` value. Missing, malformed, or
older values become unknown. It synchronizes changes across tabs. The non-modal
panel appears only while the choice is unknown or when the footer
**Analytics preferences** button reopens it. Declining sends nothing to Google.
Withdrawing after GA has loaded queues a denied update and reloads the current
page so the Google script is absent for the rest of the session. Events that
happened before consent are never replayed.

Vercel Analytics and Speed Insights are not controlled by this preference.
Vercel Analytics is used as cookieless aggregate measurement when enabled.

`immediate` suppresses the choice UI, grants analytics storage while keeping
advertising consent denied, and mounts GA4 normally. Use it only after a
launch-specific privacy review confirms opt-in gating is not required. This is
a baseline, not a CMP: use a consent-management platform when a project adds
advertising, regional rules, multiple optional categories, identity, or
auditable consent requirements.

Keep analytics calls near the component that fires them. Rename events
intentionally when reporting needs change.
Reflect any added analytics, ads, chat, heatmaps, CAPTCHA, newsletter, or CRM
tools in `/privacy` before launch. Run `npm run launch:check` before client
handoff to catch missing provider disclosures and starter placeholders.
