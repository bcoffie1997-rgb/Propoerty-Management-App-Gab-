-- =============================================================================
-- Migration 002 — Row Level Security Policies
-- Santi Fortune — Property Manager MVP
--
-- Every table has owner_id (directly or transitively). All policies scope
-- access by auth.uid(). Verified by Phase 5 security checklist.
-- =============================================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table rent_payments enable row level security;
alter table expenses enable row level security;

-- Profiles
create policy "users read own profile" on profiles for select using (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);

-- Properties
create policy "owner full access properties" on properties for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Units (via property ownership)
create policy "owner access units" on units for all using (
  property_id in (select id from properties where owner_id = auth.uid())
) with check (
  property_id in (select id from properties where owner_id = auth.uid())
);

-- Tenants
create policy "owner full access tenants" on tenants for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Leases (via unit -> property ownership)
create policy "owner access leases" on leases for all using (
  unit_id in (
    select u.id from units u
    join properties p on u.property_id = p.id
    where p.owner_id = auth.uid()
  )
) with check (
  unit_id in (
    select u.id from units u
    join properties p on u.property_id = p.id
    where p.owner_id = auth.uid()
  )
);

-- Rent payments (via lease)
create policy "owner access rent_payments" on rent_payments for all using (
  lease_id in (
    select l.id from leases l
    join units u on l.unit_id = u.id
    join properties p on u.property_id = p.id
    where p.owner_id = auth.uid()
  )
) with check (
  lease_id in (
    select l.id from leases l
    join units u on l.unit_id = u.id
    join properties p on u.property_id = p.id
    where p.owner_id = auth.uid()
  )
);

-- Expenses
create policy "owner access expenses" on expenses for all using (
  property_id in (select id from properties where owner_id = auth.uid())
) with check (
  property_id in (select id from properties where owner_id = auth.uid())
);
