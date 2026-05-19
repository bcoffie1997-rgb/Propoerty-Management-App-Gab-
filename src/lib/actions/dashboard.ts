"use server";

import { addDays, format } from "date-fns";

import { getCurrentMonthRentStatus } from "@/lib/actions/rent";
import { getExpiringLeases } from "@/lib/actions/leases";
import type { LeaseFull } from "@/lib/actions/leases";
import type { RentStatusRow } from "@/lib/actions/rent";
import type { ExpenseWithProperty } from "@/lib/actions/expenses";
import { DEMO_MODE, demoGetDashboardData } from "@/lib/demo-data";
import { getSessionContext } from "@/lib/auth";

async function requireUser() {
  return getSessionContext();
}

export type PortfolioSummary = {
  totalUnits: number;
  occupiedUnits: number;
  rentDue: number;
  rentCollected: number;
  expenses: number;
  net: number;
};

export type DashboardData = {
  summary: PortfolioSummary;
  rentStatus: RentStatusRow[];
  expiringLeases: LeaseFull[];
  recentExpenses: ExpenseWithProperty[];
};

export async function getDashboardData(): Promise<DashboardData> {
  if (DEMO_MODE) return demoGetDashboardData();
  const { supabase } = await requireUser();
  const now = new Date();
  const firstOfMonth = format(
    new Date(now.getFullYear(), now.getMonth(), 1),
    "yyyy-MM-dd",
  );
  const lastOfMonth = format(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
    "yyyy-MM-dd",
  );

  const [
    { data: properties },
    { data: activeLeases },
    rentStatus,
    expiringLeases,
    { data: monthRent },
    { data: monthExpenses },
    { data: recentExpensesData },
  ] = await Promise.all([
    supabase.from("properties").select("id"),
    supabase
      .from("leases")
      .select("id, unit:units(property_id)")
      .eq("status", "active"),
    getCurrentMonthRentStatus(),
    getExpiringLeases(90),
    supabase
      .from("rent_payments")
      .select("amount_due, amount_paid, lease:leases!inner(status)")
      .eq("period_month", firstOfMonth)
      .eq("lease.status", "active"),
    supabase
      .from("expenses")
      .select("amount")
      .gte("expense_date", firstOfMonth)
      .lte("expense_date", lastOfMonth),
    supabase
      .from("expenses")
      .select("*, property:properties(id, nickname)")
      .order("expense_date", { ascending: false })
      .limit(5),
  ]);

  const { data: units } = await supabase.from("units").select("id");
  const totalUnits = units?.length ?? 0;
  const occupiedUnits = activeLeases?.length ?? 0;

  const rentDue =
    monthRent?.reduce((s, r) => s + Number(r.amount_due ?? 0), 0) ?? 0;
  const rentCollected =
    monthRent?.reduce((s, r) => s + Number(r.amount_paid ?? 0), 0) ?? 0;
  const expensesTotal =
    monthExpenses?.reduce((s, e) => s + Number(e.amount ?? 0), 0) ?? 0;

  return {
    summary: {
      totalUnits,
      occupiedUnits,
      rentDue,
      rentCollected,
      expenses: expensesTotal,
      net: rentCollected - expensesTotal,
    },
    rentStatus,
    expiringLeases,
    recentExpenses:
      (recentExpensesData as unknown as ExpenseWithProperty[]) ?? [],
  };
}
