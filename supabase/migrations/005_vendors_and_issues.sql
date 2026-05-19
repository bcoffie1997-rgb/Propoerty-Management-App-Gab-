-- =============================================================================
-- Migration 005 — Vendors + Maintenance Issues
-- Holdings — Property Manager MVP+
-- =============================================================================

-- Vendors
create table vendors (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  category text not null check (category in (
    'plumbing',
    'electrical',
    'hvac',
    'general_contractor',
    'handyman',
    'landscaping',
    'cleaning',
    'pest_control',
    'appliance',
    'other'
  )),
  contact_name text,
  email text,
  phone text,
  insurance_expiration date,
  notes text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index vendors_owner_idx on vendors(owner_id, category, active);

-- Maintenance issues / tickets
create table maintenance_issues (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  tenant_id uuid references tenants(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  title text not null,
  description text,
  category text not null default 'repair' check (category in (
    'repair',
    'plumbing',
    'electrical',
    'hvac',
    'appliance',
    'pest',
    'turnover',
    'inspection',
    'other'
  )),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'new' check (status in (
    'new',
    'assigned',
    'in_progress',
    'on_hold',
    'completed',
    'closed'
  )),
  reported_date date not null default current_date,
  due_date date,
  completed_date date,
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  invoice_ref text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index maintenance_issues_property_status_idx
  on maintenance_issues(property_id, status, priority);
create index maintenance_issues_due_idx on maintenance_issues(due_date);
create index maintenance_issues_vendor_idx on maintenance_issues(vendor_id);

-- Updated_at triggers
create trigger trg_vendors_updated before update on vendors
  for each row execute function set_updated_at();
create trigger trg_maintenance_issues_updated before update on maintenance_issues
  for each row execute function set_updated_at();

-- RLS
alter table vendors enable row level security;
alter table maintenance_issues enable row level security;

create policy "owner full access vendors" on vendors for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner access maintenance issues" on maintenance_issues for all using (
  property_id in (select id from properties where owner_id = auth.uid())
) with check (
  property_id in (select id from properties where owner_id = auth.uid())
);
