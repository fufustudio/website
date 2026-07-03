# Forms And Analytics

The contact form is a minimal optional provider pattern at `src/app/(site)/contact/contact-form/index.tsx`.

## Form Behavior

- Validates name, email, and message.
- Includes local honeypot fields.
- Caps submitted field lengths before calling the provider.
- Submits through the same-origin `/api/contact` route only when Resend is
  configured with `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
  `RESEND_TO_EMAIL`.
- Shows explicit success and error states.
- Tracks `inquiry_submitted` after successful human submission.

Resend requires an API key and a verified sending domain before production
delivery beyond test-mode limitations.

Replace the provider when a project needs server actions, a CRM, a different
transactional email provider, or authenticated workflows.
See `docs/security.md` for provider abuse controls and launch privacy guidance.

## Analytics

Vercel Analytics is enabled in `src/app/layout.tsx`.

Starter events:

- `primary_cta_click`
- `inquiry_submitted`

Keep analytics calls near the component that fires them. Rename events intentionally when reporting needs change.
