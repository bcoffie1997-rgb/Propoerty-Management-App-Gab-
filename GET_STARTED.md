# GET STARTED — 30 minute setup, then Sprint 0

Step-by-step. Follow in order.

---

## Step 1 — Create GitHub repo (2 min)

1. Go to [github.com/new](https://github.com/new)
2. Repo name: `property-manager` (or `holdings`)
3. **Private**. No README, no .gitignore, no license (we have them).
4. Create.

---

## Step 2 — Push this scaffold (3 min)

```bash
cd path/to/this/folder
git init
git add .
git commit -m "init: scaffold from build spec"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/property-manager.git
git push -u origin main
```

---

## Step 3 — Install dependencies (3 min)

```bash
npm install
```

> All 7 sprints are now implemented. The shadcn components in
> `src/components/ui/` are hand-written and committed — no shadcn CLI step
> required.

---

## Step 4 — Set up Supabase (10 min)

1. Go to [supabase.com](https://supabase.com), create new project. Wait ~2 min for provisioning.
2. Settings → API → copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key (keep this safe)
3. Set up Google OAuth:
   - [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth client ID
   - Application type: Web application
   - Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Save client ID + secret
   - In Supabase: Authentication → Providers → Google → enable, paste client ID + secret
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/auth/callback`
5. SQL Editor → run each migration in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_rent_generation_function.sql`
   - *(Skip 004 for now — that's a Sprint 4 task.)*

---

## Step 5 — Local env (2 min)

```bash
cp .env.local.example .env.local
```

Edit `.env.local`, paste your Supabase URL, anon key, and service role key.

---

## Step 6 — Smoke test (2 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → should see scaffold home page.
Open [http://localhost:3000/login](http://localhost:3000/login) → should see sign-in form.

If sign-in works → middleware is gating correctly → ready for Sprint 0.

If it doesn't, debug:
- Browser DevTools → Network → check `/auth/v1/authorize` is being hit
- Check Supabase Auth logs in dashboard
- Check that redirect URI matches exactly

---

## Step 7 — Deploy to Vercel (5 min)

1. [vercel.com/new](https://vercel.com/new) → import your GitHub repo
2. Framework preset: Next.js (auto-detected)
3. Environment variables — add all from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL once you know it)
4. Deploy.
5. After deploy: update Supabase Auth → URL Configuration with the production URL.
6. Update Google Cloud OAuth → add production redirect URI:
   `https://YOUR_PROJECT.supabase.co/auth/v1/callback` (same as before — Supabase handles the redirect)

---

## Step 8 — Sign in and load real data

The app is built. Once Supabase + OAuth are wired:

```bash
npm run dev
# → http://localhost:3000 → sign in with Google
```

Then load:

1. Add each property via **Properties → Add property**.
2. Add tenants via **Tenants → Add tenant**.
3. For each occupied unit, create a lease via the property's **Leases** tab.
   Rent rows for the lease term auto-generate.
4. Back-log the last 3 months of rent payments (mark as paid).
5. Log recent expenses via **Expenses → Add expense**.
6. Run through the Phase 5 QA checklist (build spec, section 5).

---

## You're done with setup when:

- [x] GitHub repo exists, scaffold pushed
- [x] `npm run dev` works locally
- [x] Supabase project created, migrations applied
- [x] Google OAuth working (you can sign in)
- [x] Vercel deploy is green
- [x] Real portfolio data entered, daily check works in &lt; 60 s
