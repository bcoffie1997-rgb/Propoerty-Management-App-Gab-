# Holdings

Internal property manager for a small long-term residential portfolio.
Built on Next.js 14 + Supabase + Vercel. Designed to be run by one person.

> **Status:** Repo scaffold only. The build runs in 7 sprints (see [build spec](./docs/build-spec.md)).
> Sprint 0 wires up the rest. Open Claude Code and paste the Sprint 0 prompt to begin.

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Fill in Supabase URL, anon key, and service role key

# 3. Initialize shadcn/ui (the components folder is empty; this populates it)
npx shadcn@latest init -d
# When prompted: TypeScript yes, default style, Zinc base, CSS variables yes

# 4. Add the shadcn components used in the MVP
npx shadcn@latest add button card dialog sheet drawer dropdown-menu \
  form input label select separator table tabs toast badge \
  alert calendar popover textarea avatar skeleton

# 5. Run locally
npm run dev
# → http://localhost:3000
```

You'll see a placeholder home page. Auth doesn't work yet until Sprint 0
sets up the Supabase project and OAuth — that's the first sprint.

---

## Single-User Mode (No Login Screen)

This app can run as a one-person system with no login UI, including online deployment.

Set these env vars in `.env.local`:

```bash
NEXT_PUBLIC_SINGLE_USER_MODE=1
OWNER_ID=<your Supabase auth user UUID>
OWNER_EMAIL=<your email, used for display only>
NEXT_PUBLIC_OWNER_ID=<same UUID as OWNER_ID>
```

How to get `OWNER_ID`:

1. Temporarily run with `NEXT_PUBLIC_SINGLE_USER_MODE=0`.
2. Sign in once with Google.
3. Copy your user UUID from `Settings`.
4. Turn `NEXT_PUBLIC_SINGLE_USER_MODE=1` back on.

Notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` set on the server in local/dev/prod envs.
- For online deploys (Vercel), set the same vars in Project Settings → Environment Variables.
- `NEXT_PUBLIC_DEMO_MODE=1` is still read-only and should not be combined with single-user mode.
- Never expose the service role key in client code.

---

## External Access Gate (Recommended for No-Login Deploys)

If you deploy with no in-app login, enable the middleware gate:

```bash
EXTERNAL_GATE_ENABLED=1
EXTERNAL_GATE_USER=<your username>
EXTERNAL_GATE_PASSWORD=<strong random password>
```

This adds HTTP Basic Auth at the edge before the app loads.

For Vercel:

1. Add these 3 env vars in Project Settings.
2. Redeploy.
3. Accessing your app URL will prompt for username/password.

---

## Setup: Supabase

1. Create a project at [supabase.com](https://supabase.com). Save:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
2. Apply migrations in order (SQL Editor, paste & run each file):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_rent_generation_function.sql`
3. Storage bucket for receipts (Sprint 4):
   - Storage → New bucket → name: `receipts`, public: OFF
   - Then run `supabase/migrations/004_storage_policies.sql`
4. Auth → Providers → Google: enable, paste OAuth client ID & secret.
5. Auth → URL Configuration:
   - Site URL: `http://localhost:3000` for dev (update to prod URL on deploy)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and the
     production equivalent

---

## Setup: Vercel

1. Push this repo to GitHub (private).
2. Import the repo on [vercel.com](https://vercel.com).
3. Add the three Supabase env vars + `NEXT_PUBLIC_APP_URL` to all three
   environments (Production, Preview, Development).
4. Custom domain: recommend a subdomain on an existing domain.
5. After first deploy, update Supabase Auth → URL Configuration with the
   production URL.

---

## Project Structure

```
src/
├── app/                     # Next.js App Router routes
│   ├── auth/callback/       # OAuth exchange route
│   ├── login/               # Sign-in page
│   ├── properties/          # Properties list + detail
│   ├── tenants/             # Tenants list + detail
│   ├── expenses/            # All-expenses view
│   ├── settings/            # Profile, theme toggle
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Tailwind + theme tokens
│   └── page.tsx             # Dashboard (replaced in Sprint 5)
├── components/
│   ├── ui/                  # shadcn components (added via CLI)
│   ├── shared/              # StatusBadge, MoneyCell, EmptyState, etc.
│   ├── properties/          # Property forms, cards
│   ├── tenants/             # Tenant forms
│   ├── leases/              # Lease form, detail drawer, renew dialog
│   ├── rent/                # Mark-paid dialog
│   ├── expenses/            # Expense form
│   └── dashboard/           # Alert banner, rent status table, cards
├── lib/
│   ├── supabase/            # client, server, middleware (pre-wired)
│   ├── actions/             # Server actions (built per sprint)
│   ├── schemas/             # Zod schemas (built per sprint)
│   ├── format.ts            # Money, date, address formatters
│   └── utils.ts             # cn() helper
├── types/                   # TypeScript types (database.ts from Supabase)
└── middleware.ts            # Auth gate

supabase/
└── migrations/              # SQL migrations (apply in order)

docs/
└── build-spec.md            # Full 7-phase build spec
```

---

## Build Order

The work happens in 7 sprints, each with a paste-ready prompt for Claude Code.
Full prompts are in [docs/build-spec.md](./docs/build-spec.md), Appendix C.

| Sprint | Goal | Days |
|--------|------|------|
| 0 | Foundation — auth working, deployed to Vercel | 0.5 |
| 1 | Properties + Units CRUD | 1 |
| 2 | Tenants + Leases + expiry alerts | 1.5 |
| 3 | Rent tracking (manual log) | 1.5 |
| 4 | Expenses + receipt upload | 1 |
| 5 | Dashboard + per-property P&L + CSV export | 1.5 |
| 6 | Polish + mobile + dogfood with real data | 1 |

**Total: ~8 focused days.**

---

## Workflow with Claude Code

1. Open this repo in Claude Code on the Mac Mini.
2. Open `docs/build-spec.md`, scroll to Appendix C.
3. Copy the Sprint 0 prompt verbatim and paste into Claude Code.
4. Let it work. Test against the acceptance criteria at the bottom of the prompt.
5. Commit. Move to Sprint 1.

**Do not skip the acceptance criteria.** They're the gate between sprints.

---

## Conventions

- **Server Actions over API routes.** Only `/auth/callback` is a route handler.
- **Zod schemas mirror the database.** Validation runs server-side, always.
- **RLS is the security boundary.** Every table has `owner_id`. Never bypass with
  the service role key from the client.
- **Money fields:** `numeric(10,2)` in Postgres, `string | number` in TS, always
  formatted with `formatMoney()`.
- **Dates:** `date` in Postgres, ISO strings in TS (`YYYY-MM-DD`).
- **Tabular numerals** on every money column (`.tabular-nums` utility).
- **Empty states are dry, not perky.** ("No expenses logged. Probably wrong.")

---

## Out of Scope for MVP

Don't build these in MVP, no matter how tempting (see Phase 7 for the v1.1 backlog):

- Online rent payments (Stripe / Plaid)
- Tenant-facing portal
- AI features (Claude API)
- Maintenance request module (collapsed into Expenses for MVP)
- Document vault (use Google Drive temporarily)
- E-signatures
- SMS / email automation
- Multi-user / team access

---

## New Modules Added

- `vendors`: store contractor contacts, categories, notes, insurance expirations.
- `issues`: track maintenance requests with priority, status, due dates, vendor assignment, and actual costs.

Apply this migration after `004_storage_policies.sql`:

- `supabase/migrations/005_vendors_and_issues.sql`

---

## License

Private. Not licensed for distribution.
# Propoerty-Management-App-Gab-
