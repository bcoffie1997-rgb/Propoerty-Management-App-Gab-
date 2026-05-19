"use server";

import { addDays, format } from "date-fns";
import { revalidatePath } from "next/cache";

import { leaseSchema, type LeaseInput } from "@/lib/schemas/lease";
import type {
  Lease,
  Property,
  RentPayment,
  Tenant,
  Unit,
} from "@/types/database";
import {
  DEMO_MODE,
  assertNotDemo,
  demoGetExpiringLeases,
  demoGetLeaseById,
  demoGetLeasesForProperty,
} from "@/lib/demo-data";
import { getSessionContext } from "@/lib/auth";

async function requireUser() {
  return getSessionContext();
}

export type LeaseFull = Lease & {
  tenant: Tenant;
  unit: Unit & { property: Property };
};

export type LeaseDetail = LeaseFull & { rent_payments: RentPayment[] };

export async function getLeasesForProperty(
  propertyId: string,
): Promise<LeaseFull[]> {
  if (DEMO_MODE) return demoGetLeasesForProperty(propertyId);
  const { supabase } = await requireUser();
  const { data: units } = await supabase
    .from("units")
    .select("id")
    .eq("property_id", propertyId);
  const unitIds = (units ?? []).map((u) => u.id);
  if (unitIds.length === 0) return [];
  const { data: leases, error } = await supabase
    .from("leases")
    .select("*, tenant:tenants(*), unit:units(*, property:properties(*))")
    .in("unit_id", unitIds)
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (leases as unknown as LeaseFull[]) ?? [];
}

export async function getLeaseById(id: string): Promise<LeaseDetail | null> {
  if (DEMO_MODE) return demoGetLeaseById(id);
  const { supabase } = await requireUser();
  const { data: lease } = await supabase
    .from("leases")
    .select("*, tenant:tenants(*), unit:units(*, property:properties(*))")
    .eq("id", id)
    .single();
  if (!lease) return null;
  const { data: rent_payments } = await supabase
    .from("rent_payments")
    .select("*")
    .eq("lease_id", id)
    .order("period_month", { ascending: false });
  return {
    ...(lease as unknown as LeaseFull),
    rent_payments: rent_payments ?? [],
  };
}

export async function getExpiringLeases(
  daysAhead = 90,
): Promise<LeaseFull[]> {
  if (DEMO_MODE) return demoGetExpiringLeases(daysAhead);
  const { supabase } = await requireUser();
  const today = format(new Date(), "yyyy-MM-dd");
  const future = format(addDays(new Date(), daysAhead), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("leases")
    .select("*, tenant:tenants(*), unit:units(*, property:properties(*))")
    .eq("status", "active")
    .gte("end_date", today)
    .lte("end_date", future)
    .order("end_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as LeaseFull[]) ?? [];
}

async function generateRentPeriods(leaseId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("generate_rent_periods", {
    p_lease_id: leaseId,
  });
  if (error) throw new Error(error.message);
}

export async function createLease(input: LeaseInput) {
  assertNotDemo("Creating a lease");
  const { supabase } = await requireUser();
  const parsed = leaseSchema.parse(input);

  const { data: overlap } = await supabase
    .from("leases")
    .select("id")
    .eq("unit_id", parsed.unit_id)
    .eq("status", "active")
    .lte("start_date", parsed.end_date)
    .gte("end_date", parsed.start_date);
  if (overlap && overlap.length > 0) {
    throw new Error("This unit already has an active lease in that period.");
  }

  const { data, error } = await supabase
    .from("leases")
    .insert({ ...parsed, status: "active" })
    .select("id, unit_id")
    .single();
  if (error) throw new Error(error.message);

  await generateRentPeriods(data.id);

  const { data: unit } = await supabase
    .from("units")
    .select("property_id")
    .eq("id", data.unit_id)
    .single();
  if (unit?.property_id) {
    revalidatePath(`/properties/${unit.property_id}`);
  }
  revalidatePath("/tenants");
  revalidatePath("/");
  return data;
}

export async function renewLease({
  leaseId,
  newEndDate,
  newMonthlyRent,
}: {
  leaseId: string;
  newEndDate: string;
  newMonthlyRent: number;
}) {
  assertNotDemo("Renewing a lease");
  const { supabase } = await requireUser();
  const { data: old, error: oldErr } = await supabase
    .from("leases")
    .select("*")
    .eq("id", leaseId)
    .single();
  if (oldErr || !old) throw new Error("Lease not found.");

  const newStart = format(addDays(new Date(old.end_date), 1), "yyyy-MM-dd");
  if (newEndDate <= newStart) {
    throw new Error("Renewal end date must be after the new start date.");
  }

  const { error: expireErr } = await supabase
    .from("leases")
    .update({ status: "expired" })
    .eq("id", leaseId);
  if (expireErr) throw new Error(expireErr.message);

  const { data: created, error: insErr } = await supabase
    .from("leases")
    .insert({
      unit_id: old.unit_id,
      tenant_id: old.tenant_id,
      start_date: newStart,
      end_date: newEndDate,
      monthly_rent: newMonthlyRent,
      deposit_amount: old.deposit_amount,
      deposit_held: old.deposit_held,
      rent_due_day: old.rent_due_day,
      status: "active",
    })
    .select("id, unit_id")
    .single();
  if (insErr) throw new Error(insErr.message);

  await generateRentPeriods(created.id);

  const { data: unit } = await supabase
    .from("units")
    .select("property_id")
    .eq("id", created.unit_id)
    .single();
  if (unit?.property_id) {
    revalidatePath(`/properties/${unit.property_id}`);
  }
  revalidatePath("/tenants");
  revalidatePath("/");
  return created;
}

export async function terminateLease({
  leaseId,
  terminationDate,
}: {
  leaseId: string;
  terminationDate: string;
}) {
  assertNotDemo("Terminating a lease");
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("leases")
    .update({ status: "terminated", end_date: terminationDate })
    .eq("id", leaseId);
  if (error) throw new Error(error.message);

  await supabase
    .from("rent_payments")
    .delete()
    .eq("lease_id", leaseId)
    .gt("period_month", terminationDate)
    .eq("status", "unpaid");

  const { data: lease } = await supabase
    .from("leases")
    .select("unit_id, unit:units(property_id)")
    .eq("id", leaseId)
    .single();
  const propertyId = (lease?.unit as unknown as { property_id: string } | null)
    ?.property_id;
  if (propertyId) revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/tenants");
  revalidatePath("/");
}
