# Forms And Analytics

The contact form is a minimal optional provider pattern at
`src/app/(site)/message-form/index.tsx`.

## Form Behavior

- Validates the visitor name, email, and message fields.
- Includes local honeypot fields.
- Caps submitted field lengths before calling the provider.
- Submits through the same-origin `/api/contact` route only when Resend is
  configured with `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
  `RESEND_TO_EMAIL`. This launch defaults the recipient to
  `hello@fufu.studio`.
- Shows explicit success and error states.
- Tracks `inquiry_submitted` after successful human submission.
- Sends from the configured site sender, delivers to the configured intake
  recipient, and sets `replyTo` to the visitor email so inbox replies go back
  to the submitter.
- Links to `/privacy` near the submit area so visitors can review how inquiry
  and analytics data are handled before submitting.

Resend requires an API key and a verified sending domain before production
delivery beyond test-mode limitations.

Replace the provider when a project needs a full inquiry form, server actions,
a CRM, a different transactional email provider, or authenticated workflows.
See `docs/security.md` for provider abuse controls and launch privacy guidance.

## Analytics

Vercel Analytics and Speed Insights are mounted through
`src/components/scripts/vercel-insights` in the root layout. Google Analytics is
loaded by `src/components/scripts/google-analytics` from the public site layout
and configured through `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`, defaulting to
`G-Q8ZQF7VMNL`.

Starter events:

- `primary_cta_click`
- `inquiry_submitted`

Keep analytics calls near the component that fires them. Rename events intentionally when reporting needs change.
Do not send email addresses, message contents, names, phone numbers, or other
contact-form personal information in analytics event names or custom
properties.
