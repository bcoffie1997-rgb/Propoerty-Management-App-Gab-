-- =============================================================================
-- Migration 003 — Rent Generation & Status Functions
-- Santi Fortune — Property Manager MVP
--
-- generate_rent_periods: called by createLease + renewLease server actions
-- recalc_rent_statuses:  called by getCurrentMonthRentStatus + getDashboardData
-- =============================================================================

-- Generate rent_payment rows for current + future months for a lease
create or replace function generate_rent_periods(p_lease_id uuid)
returns void as $$
declare
  v_lease record;
  v_period date;
begin
  select * into v_lease from leases where id = p_lease_id;
  if v_lease is null then return; end if;

  v_period := date_trunc('month', v_lease.start_date)::date;

  while v_period <= least(v_lease.end_date, (current_date + interval '2 months')::date) loop
    insert into rent_payments (lease_id, period_month, amount_due, status)
    values (p_lease_id, v_period, v_lease.monthly_rent, 'unpaid')
    on conflict (lease_id, period_month) do nothing;
    v_period := (v_period + interval '1 month')::date;
  end loop;
end;
$$ language plpgsql security definer;

-- Recalc status: mark 'late' if past due day and not paid
create or replace function recalc_rent_statuses() returns void as $$
begin
  update rent_payments rp
  set status = case
    when amount_paid >= amount_due then 'paid'
    when amount_paid > 0 then 'partial'
    when current_date > (period_month + (
      (select rent_due_day from leases where id = rp.lease_id) - 1
    ) * interval '1 day')::date then 'late'
    else 'unpaid'
  end
  where status != 'paid';
end;
$$ language plpgsql security definer;
