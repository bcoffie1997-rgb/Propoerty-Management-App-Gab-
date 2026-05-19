"use server";

import { revalidatePath } from "next/cache";

import { tenantSchema, type TenantInput } from "@/lib/schemas/tenant";
import type {
  Tenant,
  Lease,
  Unit,
  Property,
  RentPayment,
} from "@/types/database";
import {
  DEMO_MODE,
  assertNotDemo,
  demoGetTenants,
  demoGetTenantById,
} from "@/lib/demo-data";
import { getSessionContext } from "@/lib/auth";

async function requireUser() {
  return getSessionContext();
}

export type TenantWithCurrentLease = Tenant & {
  current_lease: (Lease & { unit: Unit & { property: Property } }) | null;
};

export async function getTenants(): Promise<TenantWithCurrentLease[]> {
  if (DEMO_MODE) return demoGetTenants();
  const { supabase } = await requireUser();
  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("*")
    .order("last_name", { ascending: true });
  if (error) throw new Error(error.message);
  if (!tenants || tenants.length === 0) return [];

  const { data: leases } = await supabase
    .from("leases")
    .select("*, unit:units(*, property:properties(*))")
    .in(
      "tenant_id",
      tenants.map((t) => t.id),
    )
    .eq("status", "active");

  type LeaseRow = NonNullable<typeof leases>[number];
  const leaseByTenant = new Map<string, LeaseRow>();
  (leases ?? []).forEach((l: LeaseRow) => leaseByTenant.set(l.tenant_id, l));

  return tenants.map((t) => ({
    ...t,
    current_lease: (leaseByTenant.get(t.id) as unknown as
      | (Lease & { unit: Unit & { property: Property } })
      | undefined) ?? null,
  }));
}

export type TenantDetail = {
  tenant: Tenant;
  leases: Array<Lease & { unit: Unit & { property: Property } }>;
  rent_history: RentPayment[];
};

export async function getTenantById(id: string): Promise<TenantDetail | null> {
  if (DEMO_MODE) return demoGetTenantById(id);
  const { supabase } = await requireUser();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();
  if (!tenant) return null;

  const { data: leases } = await supabase
    .from("leases")
    .select("*, unit:units(*, property:properties(*))")
    .eq("tenant_id", id)
    .order("start_date", { ascending: false });

  const leaseIds = (leases ?? []).map((l) => l.id);
  let rent_history: RentPayment[] = [];
  if (leaseIds.length > 0) {
    const { data } = await supabase
      .from("rent_payments")
      .select("*")
      .in("lease_id", leaseIds)
      .order("period_month", { ascending: false })
      .limit(24);
    rent_history = data ?? [];
  }

  return {
    tenant,
    leases:
      (leases as unknown as Array<
        Lease & { unit: Unit & { property: Property } }
      >) ?? [],
    rent_history,
  };
}

export async function createTenant(input: TenantInput) {
  assertNotDemo("Adding a tenant");
  const { supabase, userId } = await requireUser();
  const parsed = tenantSchema.parse(input);
  const { data, error } = await supabase
    .from("tenants")
    .insert({ ...parsed, owner_id: userId })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/tenants");
  return data as Tenant;
}

export async function updateTenant(id: string, input: TenantInput) {
  assertNotDemo("Editing a tenant");
  const { supabase } = await requireUser();
  const parsed = tenantSchema.parse(input);
  const { error } = await supabase.from("tenants").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tenants");
  revalidatePath(`/tenants/${id}`);
}

export async function deleteTenant(id: string) {
  assertNotDemo("Deleting a tenant");
  const { supabase } = await requireUser();
  const { count } = await supabase
    .from("leases")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", id)
    .eq("status", "active");
  if ((count ?? 0) > 0) {
    throw new Error("Cannot delete a tenant with an active lease.");
  }
  const { error } = await supabase.from("tenants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tenants");
}
