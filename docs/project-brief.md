# Project Brief

| Field             | Value                                    |
| ----------------- | ---------------------------------------- |
| Project/site name | Fufu Studio                              |
| Design source     | New visual direction and content are TBD |
| Current phase     | Structural reset onto `fufu-starter`     |

## Interim Scope

- Keep one sparse landing page with hero, flexible content, and contact regions.
- Keep `/privacy`, the contact API, metadata routes, and reusable layout recipes.
- Preserve Fufu Studio identity and operational contact/legal facts.
- Remove the retired palette, typography, portraits, marketing copy, and motion.
- Run Sanity Studio as an independently deployable top-level application.

## Privacy Intake

| Field                         | Value                                           |
| ----------------------------- | ----------------------------------------------- |
| Business name                 | Fufu Studio                                     |
| Public privacy contact        | `hello@fufu.studio`                             |
| Privacy policy effective date | July 10, 2026                                   |
| Contact delivery              | Resend when configured                          |
| Contact abuse prevention      | Upstash when configured                         |
| Hosting and performance       | Vercel, Vercel Analytics, Vercel Speed Insights |
| Optional analytics            | Google Analytics when configured                |
| CMS                           | Sanity stores public website content            |

## Environment Notes

- Web and Studio Sanity settings identify the same project and dataset.
- Studio receives its own deployment origin through environment configuration.
- Secrets remain in local or deployment environment files and are never copied
  into this brief.
