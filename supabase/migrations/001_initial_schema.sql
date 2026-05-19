-- =============================================================================
-- Migration 001 — Initial Schema
-- Holdings — Property Manager MVP
-- =============================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- Properties
create table properties (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  nickname text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip text not null,
  property_type text default 'single_family',
  purchase_date date,
  purchase_price numeric(12,2),
  current_value numeric(12,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Units (1 per property for SFR; schema supports multi-unit)
create table units (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  unit_label text default 'Main',
  bedrooms int,
  bathrooms numeric(3,1),
  sqft int,
  market_rent numeric(10,2),
  notes text,
  created_at timestamptz default now()
);

-- Tenants
create table tenants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  emergency_contact text,
  notes text,
  created_at timestamptz default now()
);

-- Leases
create table leases (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references units(id) on delete restrict not null,
  tenant_id uuid references tenants(id) on delete restrict not null,
  start_date date not null,
  end_date date not null,
  monthly_rent numeric(10,2) not null,
  deposit_amount numeric(10,2),
  deposit_held boolean default true,
  rent_due_day int default 1 check (rent_due_day between 1 and 28),
  status text default 'active' check (status in ('active','expired','terminated')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index leases_unit_status_idx on leases(unit_id, status);

-- Rent payments
create table rent_payments (
  id uuid default uuid_generate_v4() primary key,
  lease_id uuid references leases(id) on delete cascade not null,
  period_month date not null, -- always YYYY-MM-01
  amount_due numeric(10,2) not null,
  amount_paid numeric(10,2) default 0,
  paid_date date,
  payment_method text,
  status text default 'unpaid' check (status in ('paid','partial','late','unpaid')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(lease_id, period_month)
);

create index rent_payments_lease_idx on rent_payments(lease_id, period_month);

-- Expenses
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  category text not null check (category in (
    'mortgage','tax','insurance','repair','utility','management','hoa','other'
  )),
  amount numeric(10,2) not null,
  expense_date date not null,
  vendor text,
  description text,
  receipt_url text,
  recurring boolean default false,
  created_at timestamptz default now()
);

create index expenses_property_date_idx on expenses(property_id, expense_date);

-- Updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_properties_updated before update on properties
  for each row execute function set_updated_at();
create trigger trg_leases_updated before update on leases
  for each row execute function set_updated_at();
create trigger trg_rent_updated before update on rent_payments
  for each row execute function set_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-create main unit when property created
create or replace function create_default_unit() returns trigger as $$
begin
  insert into units (property_id, unit_label) values (new.id, 'Main');
  return new;
end;
$$ language plpgsql;

create trigger trg_property_default_unit
  after insert on properties
  for each row execute function create_default_unit();
