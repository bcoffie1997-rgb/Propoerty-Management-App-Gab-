"use server";

import { format, parse } from "date-fns";

import { CATEGORY_LABELS } from "@/lib/schemas/expense";
import type { ExpenseCategory } from "@/types/database";
import {
  DEMO_MODE,
  demoExportFinancialsCSV,
  demoGetPropertyFinancials,
} from "@/lib/demo-data";
import { getSessionContext } from "@/lib/auth";

async function requireUser() {
  return getSessionContext();
}

export type CategoryBreakdown = {
  category: ExpenseCategory;
  label: string;
  amount: number;
};

export type PropertyFinancials = {
  monthLabel: string;
  rentCollected: number;
  rentDue: number;
  expenses: number;
  net: number;
  byCategory: CategoryBreakdown[];
};

function monthBounds(yyyymm: string): { first: string; last: string } {
  const first = parse(`${yyyymm}-01`, "yyyy-MM-dd", new Date());
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  return {
    first: format(first, "yyyy-MM-dd"),
    last: format(last, "yyyy-MM-dd"),
  };
}

export async function getPropertyFinancials(
  propertyId: string,
  yyyymm: string,
): Promise<PropertyFinancials> {
  if (DEMO_MODE) return demoGetPropertyFinancials(propertyId, yyyymm);
  const { supabase } = await requireUser();
  const { first, last } = monthBounds(yyyymm);

  const { data: units } = await supabase
    .from("units")
    .select("id")
    .eq("property_id", propertyId);
  const unitIds = (units ?? []).map((u) => u.id);

  let rentCollected = 0;
  let rentDue = 0;

  if (unitIds.length > 0) {
    const { data: leases } = await supabase
      .from("leases")
      .select("id")
      .in("unit_id", unitIds);
    const leaseIds = (leases ?? []).map((l) => l.id);
    if (leaseIds.length > 0) {
      const { data: rent } = await supabase
        .from("rent_payments")
        .select("amount_due, amount_paid")
        .in("lease_id", leaseIds)
        .eq("period_month", first);
      rentCollected =
        rent?.reduce((s, r) => s + Number(r.amount_paid ?? 0), 0) ?? 0;
      rentDue =
        rent?.reduce((s, r) => s + Number(r.amount_due ?? 0), 0) ?? 0;
    }
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("category, amount")
    .eq("property_id", propertyId)
    .gte("expense_date", first)
    .lte("expense_date", last);

  const byCategoryMap = new Map<ExpenseCategory, number>();
  (expenses ?? []).forEach((e) => {
    byCategoryMap.set(
      e.category,
      (byCategoryMap.get(e.category) ?? 0) + Number(e.amount ?? 0),
    );
  });
  const expensesTotal = Array.from(byCategoryMap.values()).reduce(
    (a, b) => a + b,
    0,
  );

  const byCategory: CategoryBreakdown[] = Array.from(byCategoryMap.entries())
    .map(([category, amount]) => ({
      category,
      label: CATEGORY_LABELS[category],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    monthLabel: format(parse(first, "yyyy-MM-dd", new Date()), "MMMM yyyy"),
    rentCollected,
    rentDue,
    expenses: expensesTotal,
    net: rentCollected - expensesTotal,
    byCategory,
  };
}

export async function exportFinancialsCSV(
  propertyId: string,
  yyyymm: string,
): Promise<string> {
  if (DEMO_MODE) return demoExportFinancialsCSV(propertyId, yyyymm);
  const { supabase } = await requireUser();
  const { first, last } = monthBounds(yyyymm);

  const { data: property } = await supabase
    .from("properties")
    .select("nickname")
    .eq("id", propertyId)
    .single();

  const { data: units } = await supabase
    .from("units")
    .select("id, unit_label")
    .eq("property_id", propertyId);
  const unitIds = (units ?? []).map((u) => u.id);

  type Row = {
    date: string;
    type: "Rent" | "Expense";
    category: string;
    counterparty: string;
    amount: number;
  };
  const rows: Row[] = [];

  if (unitIds.length > 0) {
    const { data: leases } = await supabase
      .from("leases")
      .select("id, tenant:tenants(first_name, last_name)")
      .in("unit_id", unitIds);
    const leaseIds = (leases ?? []).map((l) => l.id);
    const tenantByLease = new Map<string, string>();
    (leases ?? []).forEach((l) => {
      const tenant = l.tenant as unknown as {
        first_name: string;
        last_name: string;
      } | null;
      tenantByLease.set(
        l.id,
        tenant ? `${tenant.first_name} ${tenant.last_name}` : "Tenant",
      );
    });
    if (leaseIds.length > 0) {
      const { data: rent } = await supabase
        .from("rent_payments")
        .select("lease_id, period_month, paid_date, amount_paid")
        .in("lease_id", leaseIds)
        .eq("period_month", first)
        .gt("amount_paid", 0);
      (rent ?? []).forEach((r) => {
        rows.push({
          date: r.paid_date ?? r.period_month,
          type: "Rent",
          category: "Rent",
          counterparty: tenantByLease.get(r.lease_id) ?? "Tenant",
          amount: Number(r.amount_paid),
        });
      });
    }
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("expense_date, category, vendor, description, amount")
    .eq("property_id", propertyId)
    .gte("expense_date", first)
    .lte("expense_date", last);
  (expenses ?? []).forEach((e) => {
    rows.push({
      date: e.expense_date,
      type: "Expense",
      category: CATEGORY_LABELS[e.category as ExpenseCategory] ?? e.category,
      counterparty: e.vendor ?? e.description ?? "",
      amount: -Number(e.amount ?? 0),
    });
  });

  rows.sort((a, b) => a.date.localeCompare(b.date));

  const header = ["Date", "Type", "Category", "Vendor/Tenant", "Amount"];
  const escape = (v: string) =>
    /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const lines = [
    `# ${property?.nickname ?? "Property"} — ${format(parse(first, "yyyy-MM-dd", new Date()), "MMMM yyyy")}`,
    header.join(","),
    ...rows.map((r) =>
      [
        r.date,
        r.type,
        r.category,
        escape(r.counterparty),
        r.amount.toFixed(2),
      ].join(","),
    ),
  ];
  return lines.join("\n");
}
