# Royce OS

Royce OS is a personal AI-assisted navigation system for an international artist and nonprofit founder. The app turns travel, outreach, content, budget, and collaboration planning into one operating dashboard built around the principle: **everything is an opportunity**.

## What this prototype includes

- Travel route planning across Shanghai, Taipei, Seoul, Bangkok, Ho Chi Minh City, and Kuala Lumpur.
- City intelligence for accommodation cost, busking opportunity, sponsor density, networking, safety, and visa ease.
- Sponsor outreach accountability toward 1,000 emails by January with a 30-emails-every-two-days cadence.
- Opportunity-first CRM cards for brands, cultural centers, foundations, tourism offices, and music partners.
- One-year runway projection using expense-only forecasting.
- Task priorities, content progress, activity tracking, and AI assistant notes.
- Supabase/Postgres schema for the full data model in `database/schema.sql`.

## Tech stack

- Vite
- React
- TypeScript
- CSS modules via plain `src/styles.css`
- Supabase/Postgres-ready SQL schema and serverless memory endpoint

## Getting started

```bash
npm install
npm run dev
```

## Supabase memory

Royce OS now includes a Supabase-ready memory layer:

- `database/schema.sql` contains the broader Royce OS database model plus focused memory tables.
- `api/royce-memory.js` reads/writes the current Royce Data JSON snapshot to `royce_operating_memory`.
- The frontend always saves to browser `localStorage` first, then syncs to Supabase when `SUPABASE_DATABASE_URL` is configured.
- The UI shows whether it is using **Supabase memory** or **Local fallback**.

Required deployment environment variables:

```bash
SUPABASE_DATABASE_URL=postgresql://...
```

The project URL and anon key should also be stored for future Supabase client work:

```bash
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Data model

The schema in `database/schema.sql` includes:

- auth/profile extension tables
- dashboard metrics
- tasks
- organizations, contacts, and interactions
- sponsorship opportunities and deals
- opportunities and applications
- travel intelligence tables
- content planning tables
- outreach campaigns, messages, and follow-ups
- events, partners, and outcomes
- financial accounts, transactions, and runway forecasts
- AI conversations/messages plus Royce AI Plan tips/actions
- nonprofit projects, donors, and donations

The frontend uses typed seed data in `src/data.ts` and persists live Royce Data through `src/royceMemory.ts`.
