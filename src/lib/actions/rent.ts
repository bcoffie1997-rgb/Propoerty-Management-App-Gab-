"use server";

import { format } from "date-fns";
import { revalidatePath } from "next/cache";

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
  demoGetCurrentMonthRentStatus,
  demoGetRentHistoryForLease,
} from "@/lib/demo-data";
import { getSessionContext } from "@/lib/auth";

async function requireUser() {
  return getSessionContext();
}

export type RentStatusRow = RentPayment & {
  lease: Lease & {
    tenant: Tenant;
    unit: Unit & { property: Property };
  };
};

async function recalc() {
  if (DEMO_MODE) return;
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("recalc_rent_statuses");
  if (error) throw new Error(error.message);
}

export async function recalcRentStatuses() {
  await recalc();
}

function currentPeriodMonth(): string {
  const d = new Date();
  return format(new Date(d.getFullYear(), d.getMonth(), 1), "yyyy-MM-dd");
}

export async function getCurrentMonthRentStatus(): Promise<RentStatusRow[]> {
  if (DEMO_MODE) return demoGetCurrentMonthRentStatus();
  await recalc();
  const { supabase } = await requireUser();
  const period = currentPeriodMonth();
  const { data, error } = await supabase
    .from("rent_payments")
    .select(
      "*, lease:leases!inner(*, tenant:tenants(*), unit:units(*, property:properties(*)))",
    )
    .eq("period_month", period)
    .eq("lease.status", "active")
    .order("status", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as RentStatusRow[]) ?? [];
}

export async function getRentHistoryForLease(
  leaseId: string,
): Promise<RentPayment[]> {
  if (DEMO_MODE) return demoGetRentHistoryForLease(leaseId);
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("rent_payments")
    .select("*")
    .eq("lease_id", leaseId)
    .order("period_month", { ascending: false });
  return data ?? [];
}

export async function markRentPaid({
  rentPaymentId,
  paidDate,
  paymentMethod,
  notes,
}: {
  rentPaymentId: string;
  paidDate: string;
  paymentMethod?: string;
  notes?: string;
}) {
  assertNotDemo("Marking rent paid");
  const { supabase } = await requireUser();
  const { data: payment, error: fetchErr } = await supabase
    .from("rent_payments")
    .select("amount_due")
    .eq("id", rentPaymentId)
    .single();
  if (fetchErr || !payment) throw new Error("Rent record not found.");

  const { error } = await supabase
    .from("rent_payments")
    .update({
      amount_paid: payment.amount_due,
      paid_date: paidDate,
      payment_method: paymentMethod ?? null,
      notes: notes ?? null,
      status: "paid",
    })
    .eq("id", rentPaymentId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/tenants");
}

export async function updateRentPayment({
  rentPaymentId,
  amountPaid,
  paidDate,
  paymentMethod,
  notes,
}: {
  rentPaymentId: string;
  amountPaid: number;
  paidDate: string | null;
  paymentMethod?: string;
  notes?: string;
}) {
  assertNotDemo("Updating rent payment");
  const { supabase } = await requireUser();
  const { data: payment, error: fetchErr } = await supabase
    .from("rent_payments")
    .select("amount_due, lease_id, period_month")
    .eq("id", rentPaymentId)
    .single();
  if (fetchErr || !payment) throw new Error("Rent record not found.");

  const status =
    amountPaid >= payment.amount_due
      ? "paid"
      : amountPaid > 0
        ? "partial"
        : "unpaid";

  const { error } = await supabase
    .from("rent_payments")
    .update({
      amount_paid: amountPaid,
      paid_date: paidDate,
      payment_method: paymentMethod ?? null,
      notes: notes ?? null,
      status,
    })
    .eq("id", rentPaymentId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/tenants");
}
