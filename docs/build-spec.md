# Holdings — Property Manager MVP Build Spec

Solo landlord, 1–10 LTR units. Built on Next.js + Supabase + Vercel.
Handoff format: ready for Claude Code execution.

---

## Contents

1. [Strategy](#1-strategy)
2. [Requirements](#2-requirements)
3. [Design](#3-design)
4. [Development Plan](#4-development-plan)
5. [QA Checklist](#5-qa-checklist)
6. [Launch Plan](#6-launch-plan)
7. [Post-Launch](#7-post-launch)
8. [Appendix A — .env.example](#appendix-a--envexample)
9. [Appendix B — Database Schema](#appendix-b--database-schema)
10. [Appendix C — Sprint Claude Code Prompts](#appendix-c--sprint-claude-code-prompts)

---

## 1. Strategy

### Problem Statement

Managing a small residential portfolio means juggling tenant communication, rent tracking, maintenance requests, lease deadlines, and financial reporting across email, spreadsheets, text messages, and your head. Nothing talks to anything else, so things slip — and the cost of a missed lease renewal, late maintenance, or fuzzy financials is wildly disproportionate to the time it would take to track them in one place.

### Target User

You. Specifically: a solo landlord/owner-operator managing 1–10 long-term residential units, who values speed and ownership of data over feature bloat, runs the rest of the stack on Next.js + Supabase + Claude, and refuses to pay $40/unit/month for tools that do 80% of what's needed and 200% of what isn't.

Secondary persona (12 months out): same person, 10–25 units, possibly with a VA helping execute.

### Core Value Proposition

> *This app helps me run my entire rental portfolio from one dashboard — tenants, leases, rent, maintenance, finances — without paying for AppFolio bloat or duct-taping spreadsheets, Gmail, and Stripe together.*

The wedge over off-the-shelf tools isn't features. It's **fit**: it knows your properties, your tenants, your workflow, and eventually plugs into Claude for AI-drafted tenant comms, maintenance triage, and owner-style monthly reports.

### Success Metric (90 Days)

**Forcing function:** "Am I running 100% of my portfolio ops out of this app, with zero spreadsheets and zero Gmail-as-CRM?"

Concrete signals:
- All units, tenants, leases, and rent payments tracked in-app
- Zero maintenance requests handled outside the app
- Monthly P&L per property generated in <60 seconds
- App opened daily without dread

If after 90 days you're still living in spreadsheets for any of the above, the app failed.

### Competitor Scan

| Tool | What it does well | Why it loses for this use case |
|---|---|---|
| DoorLoop / Buildium / AppFolio | Full-featured, mature accounting, tenant portals | Built for 50+ unit PMs. $50–100/mo minimum, bloated UI, you rent your data |
| TurboTenant / RentRedi / Avail | Free or cheap, solo-landlord focused, decent rent collection + applications | Limited customization, weak reporting, no AI, data lives on their servers, ads/upsells |
| Stessa | Free, owner-focused, solid financial reporting | Reporting-only — no tenant comms, leases, or maintenance workflow |
| Spreadsheets + Gmail (status quo) | Free, fully customizable | Nothing talks to anything. The pain you're solving. |

**How yours wins:** You own the data and the code. AI-native from day one. Costs ~$20/mo to run instead of $500+/yr. Tailored exactly to your portfolio's reality.

### Strategic Fit

- **GCG (real estate):** Direct operational leverage. Every hour saved on PM is an hour into acquisition, capital, or higher-value work.
- **EVC / Quadratic:** Reference implementation for AI-native internal ops tooling — the consulting story you're already telling clients.
- **Standalone SaaS play:** Deliberately deferred. If after 6 months of using it you've nailed the workflow, productizing for other solo landlords becomes a credible v2. **Do not optimize for that now.**

---

## 2. Requirements

### MVP Feature List (5 features, hard cap)

1. **Properties & Units** — CRUD: address, type, purchase data, key details.
2. **Tenants & Leases** — Tenant profiles, lease terms, lease expiry alerts (60/30 day).
3. **Rent Tracking** — Auto-generated monthly rent rows per active lease, mark paid/unpaid, late flagging.
4. **Expenses** — Log any expense (incl. repairs) against a property; categorized; receipt photo optional.
5. **Dashboard** — Rent status, expiring leases, recent expenses, per-property monthly P&L.

### User Stories

- As an owner, I want to see every overdue rent + open maintenance issue on one screen so I can run the portfolio in under 10 minutes a day.
- As an owner, I want to log a rent payment in under 15 seconds so tracking doesn't become a chore I avoid.
- As an owner, I want to be alerted 60 and 30 days before any lease expires so I'm never scrambling on renewals.
- As an owner, I want to log a maintenance expense with a photo so I have a record at tax/insurance time.
- As an owner, I want to generate a monthly P&L per property so I know which units actually make money.
- As an owner, I want everything tied to a property or a tenant so nothing floats.

### Out of Scope (MVP)

- Online rent payment / ACH / Stripe
- Tenant-facing login or portal
- Vendor-facing login or portal
- AI features (Claude API) — v1.1
- Bank sync / Plaid / accounting integration
- E-signature
- SMS / email automation
- Listing syndication
- Application + background screening
- Native mobile app (responsive web only)
- Multi-user / team access
- Tax form generation
- **Document Vault** (use Google Drive temporarily; module ships in v1.1)
- **Maintenance Request workflow** (collapsed into Expenses for MVP)

### Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| Styling | Tailwind + shadcn/ui |
| Backend / DB | Supabase (Postgres + Auth + Storage) |
| Auth | Supabase Auth, email + Google OAuth |
| Hosting | Vercel |
| Analytics | PostHog |
| Repo | GitHub (private) |
| Build env | Claude Code on Mac Mini M4 |

### Data Model

Properties → Units → Leases is a clean hierarchy. Single-family = 1 unit per property; structure still works for a duplex. Full SQL in Appendix B.

- **profiles** — extends auth.users; name/phone
- **properties** — address, type, purchase data, notes
- **units** — child of property; defaults to 1 "Main" unit
- **tenants** — name, contact, emergency contact
- **leases** — links unit + tenant; term, rent, deposit
- **rent_payments** — auto-generated monthly rows per active lease
- **expenses** — property-scoped; category + receipt URL

### Timeline

| Sprint | Scope | Days |
|---|---|---|
| 0 | Foundation: repo, Next.js, Supabase, auth, Vercel deploy | 0.5 |
| 1 | Properties + Units CRUD | 1 |
| 2 | Tenants + Leases CRUD + expiry alerts | 1.5 |
| 3 | Rent tracking (manual log) | 1.5 |
| 4 | Expenses + receipt upload | 1 |
| 5 | Dashboard + financials + CSV export | 1.5 |
| 6 | Polish, mobile, dogfood with real data | 1 |

**Total: ~8 focused days.**

### Risk Flags

1. **Scope creep into AI-everything** — AI is v1.1, not MVP. Non-negotiable.
2. **Dogfood gap** — 90-day success metric tracks daily use.
3. **Supabase RLS misconfiguration** — every table gets `owner_id` + RLS in Sprint 0.
4. **Data import friction** — manual entry on day 1 takes 30 min for 3 units.
5. **The "real PM software" temptation** — v1.1 backlog is locked. New asks go to a parking lot.

---

## 3. Design

### User Flows

**Flow 1 — First-time setup (one-time, ~10 min):** Sign in (Google OAuth) → empty dashboard with CTA → add property → add unit(s) → add tenant → create lease → dashboard populated.

**Flow 2 — Daily check (<60 seconds):** Open `/` → scan: any rent overdue? any lease expiring? → click into red → action or close.

**Flow 3 — Log rent payment (<15 seconds):** Dashboard → click "Unpaid" badge → modal pre-filled → confirm date → Save → dashboard refreshes.

**Flow 4 — Log expense (<30 seconds):** Header nav: "+ Expense" → modal: property, category, amount, date, receipt photo → Save.

**Flow 5 — Monthly P&L review:** `/properties/[id]` → Financials tab → month picker → see rent in, expenses by category, net → Export CSV.

**Flow 6 — Lease renewal:** Dashboard alert → click → lease drawer → "Renew" → modal: new end date + new rent → Save → old lease expired, new lease created.

### Routes (8 total)

| Route | Purpose |
|---|---|
| `/` | Dashboard |
| `/login` | Sign in (Google OAuth) |
| `/properties` | Properties list (add/edit via modal) |
| `/properties/[id]` | Property detail (Overview \| Leases \| Financials \| Expenses); lease detail opens as drawer |
| `/tenants` | Tenants list (add via modal) |
| `/tenants/[id]` | Tenant detail (lease, history, payments) |
| `/expenses` | All expenses (filterable) |
| `/settings` | Profile, sign out, theme toggle |

### Wireframes (text)

**`/` — Dashboard.** Above fold: top nav (logo, +Expense / +Rent quick-add, avatar menu). Alerts strip — red/amber pills if any. Portfolio summary cards (4 wide desktop, 2x2 mobile): Total units, Occupied, This month rent (collected/expected), This month net.
Below: "Rent Status — [Current Month]" table. Lease Expirations card (next 90d). Recent Expenses card (last 5). **No charts in MVP.**

**`/properties` — List.** Header + "Add Property". Grid of property cards: nickname, address, # units, current tenant(s), this month's status.

**`/properties/[id]` — Detail.** Header: nickname, address, Edit/Delete. Tabs: Overview | Leases | Financials | Expenses.

**`/tenants/[id]` — Detail.** Header (name, phone, email, emergency). Current lease block. Rent payment history (last 12mo). Lease history.

**`/expenses` — All.** Filters: property, category, date range. Table: Date, Property, Category, Vendor, Amount, Receipt icon. Sum row at bottom.

### Visual Style

Vibe: Linear meets Stripe Dashboard. Dense but breathable. Information-first.

| Element | Choice |
|---|---|
| Color base | Neutral slate/zinc (Tailwind zinc-50 → zinc-950) |
| Primary accent | Deep emerald (emerald-600) — money-positive, calm |
| Status colors | Green = paid/active. Amber = expiring/unpaid current. Red = overdue/expired |
| Typography | Inter for UI, JetBrains Mono for $ and addresses. Tabular numerals on money |
| Density | Compact. Tight row heights on tables |
| Dark mode | Yes, day one. Toggle in Settings |
| Personality | Empty states are dry/wry: "No expenses logged. Probably wrong." |

### Component Inventory

`<StatusBadge>` • `<MoneyCell>` • `<PropertySelect>` • `<DatePicker>` • `<EmptyState>` • `<QuickAddDialog>` • `<DataTable>` • `<MonthPicker>` • `<AlertBanner>` • `<StatCard>` • `<FormField>`

### Mobile-First

- Nav collapses to hamburger; +Expense / +Rent → FAB bottom-right
- Tables → stacked cards on `<sm`
- Modals → full-screen sheets (`<Sheet>`)
- Touch targets ≥44px
- `inputmode="decimal"` on money, `capture="environment"` on receipt photo

---

## 4. Development Plan

### Build Order (7 Sprints)

See timeline table in Section 2. Each sprint has a paste-ready prompt in Appendix C.

### Folder Structure

```
property-manager/
├── src/
│   ├── app/
│   │   ├── auth/callback/route.ts
│   │   ├── login/page.tsx
│   │   ├── properties/{page.tsx, [id]/page.tsx}
│   │   ├── tenants/{page.tsx, [id]/page.tsx}
│   │   ├── expenses/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/{ui, shared, properties, tenants, leases, rent, expenses, dashboard}/
│   ├── lib/
│   │   ├── supabase/{client, server, middleware}.ts
│   │   ├── actions/{properties, tenants, leases, rent, expenses, dashboard, financials}.ts
│   │   ├── schemas/{property, tenant, lease, expense}.ts
│   │   ├── format.ts
│   │   └── utils.ts
│   ├── types/database.ts
│   └── middleware.ts
├── supabase/migrations/{001..004}.sql
├── docs/build-spec.md
├── .env.local.example
└── README.md
```

### Server Actions

| Action | Purpose |
|---|---|
| `createProperty` / `updateProperty` / `deleteProperty` / `getProperties` / `getPropertyById` | Property CRUD |
| `createTenant` / `updateTenant` / `deleteTenant` / `getTenants` / `getTenantById` | Tenant CRUD |
| `createLease` / `renewLease` / `terminateLease` / `getLeasesForProperty` / `getLeaseById` | Lease lifecycle; createLease + renewLease call `generate_rent_periods()` |
| `markRentPaid` / `updateRentPayment` / `getCurrentMonthRentStatus` / `getRentHistoryForLease` | Rent tracking |
| `createExpense` / `updateExpense` / `deleteExpense` / `getExpenses` / `uploadReceipt` | Expense CRUD + Storage |
| `getDashboardData` | Single batched fetch for dashboard |
| `getPropertyFinancials(propertyId, month)` / `exportFinancialsCSV` | Monthly P&L + CSV export |

Only one true `app/api/` route: `/auth/callback` for OAuth.

---

## 5. QA Checklist

### Critical Path (run before each prod deploy, ~15 min)

**Auth**
- [ ] Sign in with Google completes
- [ ] Visiting `/` while signed out → redirect to `/login`
- [ ] Sign out clears session, redirects to `/login`
- [ ] Refresh on any authed page doesn't flash unauth state

**Properties**
- [ ] Add → appears in list
- [ ] Edit → persists
- [ ] Delete → confirms then removes
- [ ] Card shows formatted address

**Tenants & Leases**
- [ ] Create lease → `rent_payments` auto-generated
- [ ] Renew → old expired, new starts day after
- [ ] Terminate → status updated, no future rent rows
- [ ] Cannot delete tenant with active lease
- [ ] Tenant detail shows lease + payment history

**Rent**
- [ ] Mark paid → status flips, refreshes
- [ ] Partial → status = partial
- [ ] Late: past due_day, no payment → 'late' after recalc
- [ ] Payment log <15 sec confirmed by stopwatch

**Expenses**
- [ ] Add without receipt
- [ ] Add with photo from mobile camera → uploads, preview renders
- [ ] Filters work; totals update live

**Dashboard**
- [ ] Alert banner only when overdue or lease ≤30d out
- [ ] Stat cards correct for current month
- [ ] Dashboard loads <500ms

**Financials**
- [ ] Per-property monthly P&L correct
- [ ] Month picker switches data
- [ ] CSV export opens cleanly in Excel/Numbers

### Edge Cases

| Case | Expected |
|---|---|
| Lease starts mid-month | Full rent due (MVP); v2 = prorate |
| Tenant pays before due day | Status = paid (paid beats late) |
| Two overlapping leases on same unit | `createLease` validation prevents |
| Overpay | Status = paid, amount stored as-is |
| Delete property with active lease | Warn / require terminate first |
| Receipt upload >10MB | Reject with toast |
| Different Google account | Sees only own data (RLS verified) |

### Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | >85 |
| Lighthouse Accessibility | >95 |
| LCP | <1.5s |
| CLS | <0.05 |
| Dashboard load (real data) | <500ms server, <1s perceived |
| Bundle size (first load JS) | <250kb gzipped |

### Security Checklist

- [ ] RLS enabled on every table
- [ ] Second test user cannot list/fetch/modify first user's rows
- [ ] Storage: second user cannot fetch first user's receipts
- [ ] Only `NEXT_PUBLIC_*` env vars exposed client-side
- [ ] Service role key only in server actions
- [ ] All inputs validated server-side via Zod
- [ ] Auth middleware blocks all `(app)/` routes when unauth
- [ ] No PII logged to PostHog or console
- [ ] `.env.local` in `.gitignore` (verify `git log`)

### Bug Tracking

GitHub Issues. Labels: `bug` / `enhancement` / `v2-backlog` / `polish`. Severity: `p0-blocking` / `p1-soon` / `p2-whenever`.

---

## 6. Launch Plan

### Pre-Launch Checklist

**Vercel:** repo connected → main auto-deploys → env vars set in all 3 scopes → custom domain → HTTPS enforced → deploy notifications.

**Supabase:** migrations applied to prod → RLS verified → `receipts` bucket created → Google OAuth configured → backups confirmed.

**Domain & DNS:** Vercel DNS → SSL provisioned → OAuth redirect URI updated in Google Cloud + Supabase Auth.

**Analytics:** PostHog key in env → autocapture on → custom events firing (`rent_marked_paid`, `expense_created`, `lease_created`, `property_created`) → Vercel Analytics enabled.

**Last-mile:** favicon + meta tags → `robots.txt` = Disallow → no `console.log` in prod → `.env.local` not in git history.

### Deployment

```bash
npm run build   # must complete
npm run lint    # must pass
git tag -a v0.1.0 -m "MVP launch"
git push origin v0.1.0
git push origin main   # auto-deploys
```

Rollback via Vercel Dashboard → previous deploy → "Promote to Production" (<30 seconds).

### Launch Sequence

| Stage | Criteria | Duration |
|---|---|---|
| 0 — Prod deployed | Critical path passes | Day 0 |
| 1 — Data loaded | All properties, tenants, leases, last 3mo data | Day 1–2 |
| 2 — Active dogfood | Every new payment/expense in-app only | Day 3+ |
| 3 — Source of truth | 14 consecutive days, zero spreadsheet fallback | Day 14+ |

### Monitoring

| Source | What | Cadence |
|---|---|---|
| Vercel | Build status, runtime errors | Daily Week 1, then on alert |
| Supabase | Query perf, storage, auth events | Weekly |
| PostHog | DAU, event counts | Weekly |
| GitHub Issues | Dogfooding bugs | Daily Week 1, then weekly |

### Backup / Rollback

- **Code:** Git + Vercel keeps every deploy. Rollback = 30 seconds.
- **Data:** Supabase daily backups + weekly manual SQL dump to iCloud.
- **Receipts:** Monthly local download for first 6 months.

---

## 7. Post-Launch

### Week 1 Daily Plan (~5 min/day)

- Open app, do daily check (rent, alerts) — confirms it works
- Vercel: build failures? runtime errors overnight?
- Supabase: auth issues or weird queries?
- PostHog: events firing correctly yesterday?
- GitHub Issues: log anything friction-y from yesterday

If you skip the daily check for 3 days, the dashboard isn't earning its keep yet.

### Feedback Collection

GitHub Issues only. One issue per friction point. Friday afternoon: 15-min triage.

### Iteration Cadence

- Mon–Fri: dogfood, log issues, no coding
- Sat: pick 1–3 issues, ship them
- Sun: optional bigger feature work
- **No production deploys Sunday night.**

### Metrics Dashboard

| Metric | Why |
|---|---|
| Days active in last 7 | If <5, something's broken in the workflow |
| Rent payments logged | Core action volume |
| Expenses logged | Same |
| Time on dashboard (median) | 30–90s ideal; minutes = dashboard isn't surfacing what matters |
| Avg page load | If >1s, optimize |

### V1.1 Backlog (priority order)

1. **Maintenance request module** — full workflow, vendor records, photos
2. **Document vault** — Supabase Storage with categorization
3. **Claude API integration** — AI tenant comms, monthly P&L summary
4. **Online rent collection** — Stripe or Plaid ACH
5. **Recurring expense automation** — auto-create monthly mortgage/insurance/HOA
6. **Tenant-facing portal** — read-only view for tenants
7. **Tax reports** — Schedule E export, mileage, 1099 prep
8. **E-signature** — DocuSign or BoldSign
9. **Mid-month proration**
10. **Multi-user / team access** — SaaS-ification signal

### Sunset Criteria (6-month decision date)

**Kill or pivot if:**
- Stopped using daily for 30+ consecutive days (and still own properties)
- Maintenance burden >2 hours/month
- Sold/exited the portfolio
- Competitor ships exactly this for $10/mo and you'd pay it
- Productization doesn't pencil and you no longer use it personally

**Pivot signals (don't kill, redirect):**
- Daily use is dashboard + rent only → simplify, kill unused half
- You'd pay $50/mo for this + maintenance + comms → productize, v2 SaaS
- Second user keeps asking for access → multi-tenant rewrite

**Default decision date: 6 months post-launch. Calendar it now.**

---

## Appendix A — .env.example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## Appendix B — Database Schema

Migrations live in `supabase/migrations/`. Apply in order via the Supabase SQL editor.

- `001_initial_schema.sql` — Tables, indexes, triggers (profile auto-create, default unit auto-create)
- `002_rls_policies.sql` — Row-level security on every table
- `003_rent_generation_function.sql` — `generate_rent_periods()` + `recalc_rent_statuses()`
- `004_storage_policies.sql` — Run AFTER manually creating the `receipts` bucket

See the SQL files for full contents.

---

## Appendix C — Sprint Claude Code Prompts

Paste one at a time into Claude Code. Complete + test, then move to next.

### Sprint 0 — Foundation

```
Set up Supabase auth and the authenticated app shell for a Next.js 14
App Router + TypeScript + Tailwind + shadcn/ui project.

Tasks:
1. Create src/lib/supabase/client.ts (browser) and src/lib/supabase/server.ts
   (server) using @supabase/ssr. NOTE: These files already exist in the
   scaffold — verify they work and adjust if needed.
2. Verify src/middleware.ts refreshes the Supabase session and redirects
   unauthenticated users away from any route in the (app) group to /login.
   Allow /login and /auth/callback through. (Already scaffolded; verify.)
3. Verify src/app/auth/callback/route.ts handles the Google OAuth exchange.
4. Polish src/app/login/page.tsx: centered shadcn Card, "Sign in with
   Google" button. The scaffold has a minimal version that works.
5. Build src/app/(app)/layout.tsx (move from src/app/layout.tsx structure):
   - Top nav: app wordmark "Holdings", links to Dashboard, Properties,
     Tenants, Expenses, Settings
   - Avatar dropdown right (signed-in email, sign out)
   - Floating action button bottom-right (mobile only) — placeholder
   - Wrap children in <main className="container max-w-6xl py-6">
6. Rebuild src/app/(app)/page.tsx as Dashboard placeholder showing
   "Welcome, {email}" and 4 empty <StatCard /> placeholders.
7. Set up dark mode via shadcn theme provider with system default; add
   toggle in the Settings page.
8. Apply Supabase migrations 001 and 002 via SQL editor (already in
   supabase/migrations/).
9. Deploy to Vercel: add env vars, confirm OAuth redirect URI in
   Google Cloud + Supabase Auth.

Acceptance:
- Visiting / while signed out redirects to /login.
- Google sign-in completes and lands on dashboard with email shown.
- Sign out works and redirects to /login.
- Refreshing any (app) page does not flash unauth state.
- Vercel deploy is green.
```

### Sprint 1 — Properties & Units

```
Build the Properties feature.

Tasks:
1. Add Zod schema at src/lib/schemas/property.ts matching the properties
   table; required: nickname, address_line1, city, state, zip; optional:
   purchase_date, purchase_price, current_value, notes.
2. Create server actions at src/lib/actions/properties.ts:
   createProperty, updateProperty, deleteProperty, getProperties,
   getPropertyById. All scoped by owner_id = auth.uid().
3. Build src/components/properties/property-form-dialog.tsx: shadcn
   Dialog on desktop, Sheet on mobile, react-hook-form + zodResolver.
   Props: { property?: Property, trigger: ReactNode }. Handles create + edit.
4. Build src/components/properties/property-card.tsx: shows nickname,
   address (formatted via formatAddress() in lib/format.ts), placeholder
   "—" for tenant/rent until Sprint 2/3. Whole card links to /properties/[id].
5. Build src/app/(app)/properties/page.tsx:
   - Header: "Properties" + "Add Property" button (opens dialog)
   - Grid of <PropertyCard /> — 3 col desktop, 1 col mobile
   - <EmptyState /> when none: "No properties yet. Hard to manage what
     doesn't exist." CTA to add.
6. Build src/app/(app)/properties/[id]/page.tsx:
   - Header: nickname, full address, Edit button (opens dialog), Delete
     button with confirm
   - Tabs: Overview | Leases | Financials | Expenses
   - Overview tab: render property details + notes. Other tabs placeholder.
7. Money fields use tabular numerals (.tabular-nums class).

Acceptance:
- Can add a property via dialog, see it on /properties.
- Click into property → detail page renders correctly.
- Edit property updates in place.
- Delete confirms then removes.
- RLS verified: a second test user cannot see the first user's properties.
- Mobile layout works (1 col grid, sheet replaces dialog).
```

### Sprint 2 — Tenants & Leases

```
Build Tenants and Leases.

Tasks:
1. Zod schemas: src/lib/schemas/tenant.ts and src/lib/schemas/lease.ts.
   Lease validation: end_date > start_date, monthly_rent > 0,
   rent_due_day 1-28.
2. Server actions:
   - src/lib/actions/tenants.ts: createTenant, updateTenant,
     deleteTenant (block delete if active lease exists), getTenants,
     getTenantById (include current lease + lease history + last 12mo
     rent payments).
   - src/lib/actions/leases.ts: createLease, renewLease, terminateLease,
     getLeasesForProperty, getLeaseById. After createLease + renewLease,
     call rpc('generate_rent_periods', { p_lease_id }).
   - renewLease marks old lease 'expired' and creates new lease starting
     day after old end_date.
3. Build src/components/tenants/tenant-form-dialog.tsx: create/edit
   tenant (dialog/sheet pattern).
4. Build src/components/leases/lease-form-dialog.tsx: select unit (via
   <PropertySelect /> + unit dropdown — for SFR auto-select Main),
   select tenant (or "+ New Tenant" inline), start/end dates, rent,
   deposit, rent_due_day.
5. Build src/components/leases/lease-detail-drawer.tsx: shadcn Drawer
   showing lease terms, rent history table, action buttons (Renew,
   Terminate).
6. Build src/components/leases/renew-lease-dialog.tsx: new end_date
   (default +12mo from old end), new monthly_rent (default = old).
7. Wire up Property Detail page > Leases tab:
   - Table of leases for this property's units (active first, history below)
   - "New Lease" button (opens lease dialog)
   - Click row → lease detail drawer
8. Build src/app/(app)/tenants/page.tsx: list of tenants, add button,
   each row shows current property/unit + rent + lease end date.
9. Build src/app/(app)/tenants/[id]/page.tsx: header (name, contact),
   current lease block, lease history, rent payment history table.
10. Add getExpiringLeases(daysAhead = 90) helper in
    src/lib/actions/leases.ts — used by Sprint 5 dashboard.

Acceptance:
- Can create tenant + lease end-to-end.
- Creating a lease auto-generates rent_payments rows for the lease term.
- Renew creates new lease + marks old expired; rent rows generated for new.
- Terminate sets status + end_date; no new rent rows generated past end.
- Tenant detail page shows lease + rent history correctly.
- Cannot delete a tenant with an active lease (graceful error toast).
```

### Sprint 3 — Rent Tracking

```
Build rent tracking and status logic.

Tasks:
1. Server actions in src/lib/actions/rent.ts:
   - markRentPaid(rentPaymentId, paidDate, paymentMethod, notes): sets
     amount_paid = amount_due, paid_date, payment_method, status = 'paid'.
   - updateRentPayment(id, partial): for partial payments / corrections.
   - getCurrentMonthRentStatus(): returns one row per active lease with
     property, unit, tenant, amount, status for the current period_month.
     Calls rpc('recalc_rent_statuses') first to ensure 'late' flags fresh.
   - getRentHistoryForLease(leaseId): all rent_payments rows for a lease.
2. Build src/components/rent/mark-rent-paid-dialog.tsx: pre-filled with
   amount_due, date defaulting to today, payment method dropdown
   (Cash, Check, Zelle, Venmo, ACH, Other), optional notes.
3. Build src/components/dashboard/rent-status-table.tsx:
   - Title: "Rent Status — [MonthName YYYY]"
   - Columns: Property / Unit, Tenant, Amount, Status, Action
   - Status badges color-coded (paid=green, unpaid=zinc, late=red,
     partial=amber)
   - Action: "Mark Paid" button if unpaid/late/partial → opens dialog.
4. Wire the table into the dashboard placeholder (full replace in Sprint 5).
5. Add rent history table to Property Detail > Financials placeholder
   AND to lease-detail-drawer (replace placeholder from Sprint 2).
6. Edge case handling:
   - If a lease starts mid-month, amount_due for that month is still full
     rent for MVP (code comment: v2 = prorate).
   - If paid_date is after rent_due_day, set status='paid' anyway (paid
     beats late).

Acceptance:
- Logging a rent payment takes <15 seconds end to end.
- Status badges reflect real state; 'late' triggers correctly after due day.
- Rent history visible on lease drawer and tenant detail page.
- Mobile: "Mark Paid" works in sheet mode with large touch targets.
```

### Sprint 4 — Expenses

```
Build the Expenses module + Supabase Storage for receipts.

Tasks:
1. In Supabase dashboard, create a Storage bucket named 'receipts',
   private. Then run supabase/migrations/004_storage_policies.sql.
2. Zod schema at src/lib/schemas/expense.ts.
3. Server actions in src/lib/actions/expenses.ts:
   - createExpense, updateExpense, deleteExpense
   - getExpenses(filters: { propertyId?, category?, startDate?, endDate? })
   - uploadReceipt(file: File): uploads to
     receipts/${userId}/${uuid}-${filename}, returns signed URL via
     getPublicUrl. Store path in receipt_url.
4. Build src/components/expenses/expense-form-dialog.tsx:
   - Property select, category select (Mortgage, Tax, Insurance, Repair,
     Utility, Management, HOA, Other)
   - Amount (inputmode=decimal), expense_date (defaults today)
   - Vendor, Description (textarea)
   - Receipt upload (file input with capture=environment for mobile camera)
   - Recurring checkbox (no automation in MVP; flag for v2)
5. Build src/app/(app)/expenses/page.tsx:
   - Header: "Expenses" + "Add Expense" button
   - Filter row: PropertySelect, category dropdown, date range
   - Table: Date, Property, Category, Vendor, Amount, Receipt icon
   - Click row → expand inline (description + receipt preview)
   - Sum row: total of filtered set (right-aligned, bold)
6. Wire Property Detail > Expenses tab: filtered list for that property
   + "Add Expense" pre-filled with that property.
7. Wire Floating Action Button (mobile) to open quick-add menu:
   "Add Expense" + "Mark Rent Paid".

Acceptance:
- Can add an expense with a receipt photo from mobile in <30s.
- Receipts stored in user's namespaced folder; another user cannot
  list or fetch them.
- Filters on /expenses work and total updates live.
- Receipt preview shows inline (image) or download link (PDF).
- Property detail Expenses tab renders correctly.
```

### Sprint 5 — Dashboard & P&L

```
Build the unified dashboard and per-property financials.

Tasks:
1. Server action getDashboardData() in src/lib/actions/dashboard.ts:
   returns in one call:
   - portfolio summary: total units, occupied units (active lease count),
     this_month_rent_due, this_month_rent_collected, this_month_expenses,
     this_month_net
   - current month rent status rows
   - leases expiring within 90 days (sorted by end_date asc)
   - last 5 expenses
   Should call recalc_rent_statuses() before returning.
2. Server action getPropertyFinancials(propertyId, monthYYYYMM) in
   src/lib/actions/financials.ts:
   - returns: rent_collected (sum amount_paid for active leases in that
     month), expenses grouped by category, total_expenses, net.
3. Server action exportFinancialsCSV(propertyId, monthYYYYMM): returns
   CSV string with columns Date | Type (Rent/Expense) | Category |
   Vendor/Tenant | Amount.
4. Build src/components/dashboard/alert-banner.tsx: red banner if any
   late/unpaid current-month rent, amber banner if any lease expiring
   in <=30 days. Banner shows count + link to relevant section.
5. Build src/components/dashboard/lease-expirations-card.tsx: card with
   list of upcoming expirations (next 90d), each row: tenant, property,
   end_date, days_until badge (color-coded). Empty state if none.
6. Build src/components/dashboard/recent-expenses-card.tsx: last 5
   expenses, "View all" link to /expenses.
7. Rebuild src/app/(app)/page.tsx (dashboard):
   - <AlertBanner /> at top (conditional)
   - 4 <StatCard />s: Units, Occupied, This Month Rent (collected/expected),
     This Month Net
   - <RentStatusTable /> (full width)
   - 2-col grid: <LeaseExpirationsCard /> | <RecentExpensesCard />
8. Build Financials tab on Property Detail:
   - <MonthPicker /> defaulting to current month
   - Card: "Rent Collected" total
   - Card: "Expenses" with category breakdown (label + amount per row)
   - Card: "Net" (highlighted, color-coded green/red)
   - "Export CSV" button → triggers download
9. Confirm dashboard loads in <500ms with realistic data.

Acceptance:
- Daily check is genuinely <60 seconds.
- Alert banner only renders when there's something to alert on.
- Property financials show correct rent and expenses for any month.
- CSV export downloads with correct data.
- Numbers are tabular, formatted, color-aware.
```

### Sprint 6 — Polish & Dogfood

```
Final polish pass before going live with real data.

Tasks:
1. Audit every page on mobile (375px width): no horizontal scroll, all
   primary actions reachable with thumb, tables collapse to cards.
2. Write dry, on-brand empty states for every list view. Examples:
   - Properties: "No properties yet. Hard to manage what doesn't exist."
   - Tenants: "No tenants. Suspiciously quiet."
   - Expenses: "No expenses logged. Probably wrong."
   - Rent table (no active leases): "Nothing to collect. Yet."
3. Loading states: <Skeleton /> on every fetch-heavy view.
4. Error handling: toast on every server action failure with the actual
   error message (single user; verbose is good).
5. Dark mode QA: every page, every modal, every state.
6. Add a basic favicon and meta tags (title: "Holdings", description).
7. Install PostHog (src/app/layout.tsx provider) — capture page views
   + custom events: rent_marked_paid, expense_created, lease_created,
   property_created. No PII beyond user id.
8. Manually enter real portfolio data: properties, tenants, current
   leases, last 3 months of rent + expenses.
9. Run through Phase 5 QA checklist.
10. Cut a v0.1 git tag, deploy to Vercel production with custom subdomain.

Acceptance:
- App is the source of truth for portfolio ops as of go-live date.
- Spreadsheets and Gmail-as-tracker are officially retired.
- Lighthouse Performance >85 on mobile.
- No console errors on any page.
```

---

*End of build spec. Ship it.*
