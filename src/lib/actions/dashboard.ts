"use server";

import { addDays, format } from "date-fns";

import { getCurrentMonthRentStatus } from "@/lib/actions/rent";
import { getExpiringLeases } from "@/lib/actions/leases";
import type { LeaseFull } from "@/lib/actions/leases";
import type { RentStatusRow } from "@/lib/actions/rent";
import type { ExpenseWithProperty } from "@/lib/actions/expenses";
import type { MaintenanceIssueWithRelations } from "@/lib/actions/issues";
import type { Vendor } from "@/types/database";
import {
  DEMO_MODE,
  demoGetDashboardData,
  demoGetOverdueIssues,
  demoGetExpiringVendors,
} from "@/lib/demo-data";
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
  overdueIssues: MaintenanceIssueWithRelations[];
  expiringVendors: Vendor[];
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

  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDays = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const [
    { data: properties },
    { data: activeLeases },
    rentStatus,
    expiringLeases,
    { data: monthRent },
    { data: monthExpenses },
    { data: recentExpensesData },
    { data: overdueIssuesData },
    { data: expiringVendorsData },
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
    supabase
      .from("maintenance_issues")
      .select(
        "*, property:properties(id, nickname), tenant:tenants(id, first_name, last_name), vendor:vendors(id, name, category)",
      )
      .lt("due_date", today)
      .not("status", "in", "(completed,closed)")
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("vendors")
      .select("*")
      .gte("insurance_expiration", today)
      .lte("insurance_expiration", thirtyDays)
      .eq("active", true)
      .order("insurance_expiration", { ascending: true }),
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
    overdueIssues:
      (overdueIssuesData as unknown as MaintenanceIssueWithRelations[]) ?? [],
    expiringVendors: (expiringVendorsData as unknown as Vendor[]) ?? [],
  };
}
