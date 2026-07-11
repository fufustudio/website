# Fufu Studio CMS

Standalone Sanity Studio for the web app in the repository root.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Studio runs at `http://localhost:3333`. Configure the matching web application
values in the repository-root `.env.local`.

## Commands

- `npm run dev` - run Studio locally.
- `npm run build` - build the static Studio application.
- `npm run deploy` - deploy with Sanity-managed hosting.
- `npm run typegen` - extract the Studio schema, scan web queries, and write
  `../sanity.types.ts`.
- `npm run seed` - seed the starter singleton and home page.
- `npm run validate-content` - validate required live content.
