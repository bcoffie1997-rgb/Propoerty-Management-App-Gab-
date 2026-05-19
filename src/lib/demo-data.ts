/**
 * Demo data used when NEXT_PUBLIC_DEMO_MODE=1.
 * Lets you walk through the app without a real Supabase backend.
 * Mutations throw a friendly error — read-only tour.
 *
 * Set today's reference date relative to 2026-05-19 so the dashboard
 * highlights a near-term lease expiration and a late rent payment.
 */

import type {
  Expense,
  Lease,
  Property,
  RentPayment,
  Tenant,
  Unit,
} from "@/types/database";
import type { LeaseFull } from "@/lib/actions/leases";
import type { RentStatusRow } from "@/lib/actions/rent";
import type {
  ExpenseWithProperty,
  ExpenseFilters,
} from "@/lib/actions/expenses";
import type { TenantWithCurrentLease, TenantDetail } from "@/lib/actions/tenants";
import type { DashboardData } from "@/lib/actions/dashboard";
import type {
  PropertyFinancials,
} from "@/lib/actions/financials";
import { CATEGORY_LABELS } from "@/lib/schemas/expense";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
export const SINGLE_USER_MODE = process.env.NEXT_PUBLIC_SINGLE_USER_MODE === "1";

export function assertNotDemo(action: string): void {
  if (DEMO_MODE) {
    throw new Error(
      `Demo mode is on. ${action} is disabled until you wire a real Supabase project.`,
    );
  }
}

const OWNER = "demo-owner-id";

export const DEMO_PROPERTIES: Property[] = [
  {
    id: "prop-main",
    owner_id: OWNER,
    nickname: "123 Main",
    address_line1: "123 Main St",
    address_line2: null,
    city: "Indianapolis",
    state: "IN",
    zip: "46202",
    property_type: "single_family",
    purchase_date: "2022-06-15",
    purchase_price: 240000,
    current_value: 285000,
    notes: "Roof replaced 2024. HVAC due for service every spring.",
    created_at: "2022-06-15T00:00:00Z",
    updated_at: "2024-05-01T00:00:00Z",
  },
  {
    id: "prop-oak",
    owner_id: OWNER,
    nickname: "456 Oak",
    address_line1: "456 Oak Ave",
    address_line2: "Unit 2",
    city: "Chicago",
    state: "IL",
    zip: "60618",
    property_type: "multi_family",
    purchase_date: "2020-09-01",
    purchase_price: 410000,
    current_value: 495000,
    notes: null,
    created_at: "2020-09-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "prop-pine",
    owner_id: OWNER,
    nickname: "789 Pine",
    address_line1: "789 Pine Rd",
    address_line2: null,
    city: "Austin",
    state: "TX",
    zip: "78704",
    property_type: "condo",
    purchase_date: "2023-11-10",
    purchase_price: 365000,
    current_value: 380000,
    notes: "HOA covers exterior. Quarterly assessments.",
    created_at: "2023-11-10T00:00:00Z",
    updated_at: "2024-03-22T00:00:00Z",
  },
];

export const DEMO_UNITS: Unit[] = [
  {
    id: "unit-main",
    property_id: "prop-main",
    unit_label: "Main",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1620,
    market_rent: 1800,
    notes: null,
    created_at: "2022-06-15T00:00:00Z",
  },
  {
    id: "unit-oak",
    property_id: "prop-oak",
    unit_label: "Main",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1100,
    market_rent: 1500,
    notes: null,
    created_at: "2020-09-01T00:00:00Z",
  },
  {
    id: "unit-pine",
    property_id: "prop-pine",
    unit_label: "Main",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1340,
    market_rent: 2200,
    notes: null,
    created_at: "2023-11-10T00:00:00Z",
  },
];

export const DEMO_TENANTS: Tenant[] = [
  {
    id: "tenant-sarah",
    owner_id: OWNER,
    first_name: "Sarah",
    last_name: "Chen",
    email: "sarah.chen@example.com",
    phone: "317-555-0142",
    emergency_contact: "David Chen — 317-555-0188",
    notes: null,
    created_at: "2025-07-15T00:00:00Z",
  },
  {
    id: "tenant-marcus",
    owner_id: OWNER,
    first_name: "Marcus",
    last_name: "Williams",
    email: "mwilliams@example.com",
    phone: "773-555-0211",
    emergency_contact: "Patricia Williams — 773-555-0210",
    notes: null,
    created_at: "2025-02-28T00:00:00Z",
  },
  {
    id: "tenant-jamie",
    owner_id: OWNER,
    first_name: "Jamie",
    last_name: "Park",
    email: "jamie.park@example.com",
    phone: "512-555-0177",
    emergency_contact: null,
    notes: "Works remote. Generally easy to reach midday.",
    created_at: "2025-12-18T00:00:00Z",
  },
];

export const DEMO_LEASES: Lease[] = [
  {
    id: "lease-sarah",
    unit_id: "unit-main",
    tenant_id: "tenant-sarah",
    start_date: "2025-08-01",
    end_date: "2026-08-01",
    monthly_rent: 1800,
    deposit_amount: 1800,
    deposit_held: true,
    rent_due_day: 1,
    status: "active",
    notes: null,
    created_at: "2025-07-15T00:00:00Z",
    updated_at: "2025-08-01T00:00:00Z",
  },
  {
    id: "lease-marcus",
    unit_id: "unit-oak",
    tenant_id: "tenant-marcus",
    start_date: "2025-06-15",
    end_date: "2026-06-15",
    monthly_rent: 1500,
    deposit_amount: 1500,
    deposit_held: true,
    rent_due_day: 15,
    status: "active",
    notes: "Renewal conversation in May.",
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2025-06-15T00:00:00Z",
  },
  {
    id: "lease-jamie",
    unit_id: "unit-pine",
    tenant_id: "tenant-jamie",
    start_date: "2026-01-01",
    end_date: "2027-01-01",
    monthly_rent: 2200,
    deposit_amount: 2200,
    deposit_held: true,
    rent_due_day: 1,
    status: "active",
    notes: null,
    created_at: "2025-12-18T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

function rentRow(
  id: string,
  leaseId: string,
  period: string,
  due: number,
  paidAmount: number,
  paidDate: string | null,
  status: RentPayment["status"],
  method: string | null = null,
): RentPayment {
  return {
    id,
    lease_id: leaseId,
    period_month: period,
    amount_due: due,
    amount_paid: paidAmount,
    paid_date: paidDate,
    payment_method: method,
    status,
    notes: null,
    created_at: `${period}T00:00:00Z`,
    updated_at: `${period}T00:00:00Z`,
  };
}

export const DEMO_RENT_PAYMENTS: RentPayment[] = [
  // Sarah — paid every month, current paid early
  rentRow("rp-sarah-feb", "lease-sarah", "2026-02-01", 1800, 1800, "2026-02-01", "paid", "Zelle"),
  rentRow("rp-sarah-mar", "lease-sarah", "2026-03-01", 1800, 1800, "2026-02-28", "paid", "Zelle"),
  rentRow("rp-sarah-apr", "lease-sarah", "2026-04-01", 1800, 1800, "2026-04-01", "paid", "Zelle"),
  rentRow("rp-sarah-may", "lease-sarah", "2026-05-01", 1800, 1800, "2026-05-01", "paid", "Zelle"),
  rentRow("rp-sarah-jun", "lease-sarah", "2026-06-01", 1800, 0, null, "unpaid"),
  // Marcus — late this month, partial last month
  rentRow("rp-marcus-feb", "lease-marcus", "2026-02-01", 1500, 1500, "2026-02-14", "paid", "Check"),
  rentRow("rp-marcus-mar", "lease-marcus", "2026-03-01", 1500, 1500, "2026-03-16", "paid", "Check"),
  rentRow("rp-marcus-apr", "lease-marcus", "2026-04-01", 1500, 800, "2026-04-20", "partial", "Check"),
  rentRow("rp-marcus-may", "lease-marcus", "2026-05-01", 1500, 0, null, "late"),
  // Jamie — perfect record
  rentRow("rp-jamie-feb", "lease-jamie", "2026-02-01", 2200, 2200, "2026-02-01", "paid", "ACH"),
  rentRow("rp-jamie-mar", "lease-jamie", "2026-03-01", 2200, 2200, "2026-03-01", "paid", "ACH"),
  rentRow("rp-jamie-apr", "lease-jamie", "2026-04-01", 2200, 2200, "2026-04-01", "paid", "ACH"),
  rentRow("rp-jamie-may", "lease-jamie", "2026-05-01", 2200, 2200, "2026-05-01", "paid", "ACH"),
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    property_id: "prop-main",
    category: "mortgage",
    amount: 1240,
    expense_date: "2026-05-01",
    vendor: "Chase",
    description: "Monthly P&I",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "exp-2",
    property_id: "prop-main",
    category: "insurance",
    amount: 145,
    expense_date: "2026-05-05",
    vendor: "State Farm",
    description: null,
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-05T00:00:00Z",
  },
  {
    id: "exp-3",
    property_id: "prop-oak",
    category: "repair",
    amount: 380,
    expense_date: "2026-05-10",
    vendor: "Garcia Plumbing",
    description: "Kitchen sink leak — replaced trap and supply line.",
    receipt_url: null,
    recurring: false,
    created_at: "2026-05-10T00:00:00Z",
  },
  {
    id: "exp-4",
    property_id: "prop-pine",
    category: "hoa",
    amount: 280,
    expense_date: "2026-05-01",
    vendor: "Pine Towers HOA",
    description: null,
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "exp-5",
    property_id: "prop-oak",
    category: "utility",
    amount: 92,
    expense_date: "2026-05-12",
    vendor: "ComEd",
    description: "Hallway lighting + laundry",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-12T00:00:00Z",
  },
  {
    id: "exp-6",
    property_id: "prop-main",
    category: "tax",
    amount: 2150,
    expense_date: "2026-04-10",
    vendor: "Marion County",
    description: "Q2 property tax",
    receipt_url: null,
    recurring: false,
    created_at: "2026-04-10T00:00:00Z",
  },
  {
    id: "exp-7",
    property_id: "prop-pine",
    category: "repair",
    amount: 215,
    expense_date: "2026-04-22",
    vendor: "Austin Appliance Co",
    description: "Dishwasher diagnostic + new pump.",
    receipt_url: null,
    recurring: false,
    created_at: "2026-04-22T00:00:00Z",
  },
  {
    id: "exp-8",
    property_id: "prop-main",
    category: "mortgage",
    amount: 1240,
    expense_date: "2026-04-01",
    vendor: "Chase",
    description: "Monthly P&I",
    receipt_url: null,
    recurring: true,
    created_at: "2026-04-01T00:00:00Z",
  },
];

// ----- Derived helpers -----

const propertyById = new Map(DEMO_PROPERTIES.map((p) => [p.id, p]));
const unitsByProperty = new Map<string, Unit[]>();
DEMO_UNITS.forEach((u) => {
  const list = unitsByProperty.get(u.property_id) ?? [];
  list.push(u);
  unitsByProperty.set(u.property_id, list);
});
const unitById = new Map(DEMO_UNITS.map((u) => [u.id, u]));
const tenantById = new Map(DEMO_TENANTS.map((t) => [t.id, t]));

function leaseToFull(l: Lease): LeaseFull {
  const unit = unitById.get(l.unit_id)!;
  const property = propertyById.get(unit.property_id)!;
  const tenant = tenantById.get(l.tenant_id)!;
  return { ...l, tenant, unit: { ...unit, property } };
}

export function demoGetProperties(): Property[] {
  return DEMO_PROPERTIES;
}

export function demoGetPropertyById(
  id: string,
): { property: Property; units: Unit[] } | null {
  const property = propertyById.get(id);
  if (!property) return null;
  return { property, units: unitsByProperty.get(id) ?? [] };
}

export function demoGetTenants(): TenantWithCurrentLease[] {
  return DEMO_TENANTS.map((t) => {
    const lease = DEMO_LEASES.find(
      (l) => l.tenant_id === t.id && l.status === "active",
    );
    return {
      ...t,
      current_lease: lease ? leaseToFull(lease) : null,
    };
  });
}

export function demoGetTenantById(id: string): TenantDetail | null {
  const tenant = tenantById.get(id);
  if (!tenant) return null;
  const leases = DEMO_LEASES.filter((l) => l.tenant_id === id).map(leaseToFull);
  const leaseIds = new Set(leases.map((l) => l.id));
  const rent_history = DEMO_RENT_PAYMENTS.filter((p) =>
    leaseIds.has(p.lease_id),
  ).sort((a, b) => b.period_month.localeCompare(a.period_month));
  return { tenant, leases, rent_history };
}

export function demoGetLeasesForProperty(propertyId: string): LeaseFull[] {
  const unitIds = new Set(
    (unitsByProperty.get(propertyId) ?? []).map((u) => u.id),
  );
  return DEMO_LEASES.filter((l) => unitIds.has(l.unit_id))
    .map(leaseToFull)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
}

export function demoGetLeaseById(
  id: string,
): (LeaseFull & { rent_payments: RentPayment[] }) | null {
  const lease = DEMO_LEASES.find((l) => l.id === id);
  if (!lease) return null;
  const full = leaseToFull(lease);
  const rent_payments = DEMO_RENT_PAYMENTS.filter(
    (p) => p.lease_id === lease.id,
  ).sort((a, b) => b.period_month.localeCompare(a.period_month));
  return { ...full, rent_payments };
}

export function demoGetExpiringLeases(daysAhead = 90): LeaseFull[] {
  const today = new Date("2026-05-19");
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + daysAhead);
  return DEMO_LEASES.filter((l) => {
    if (l.status !== "active") return false;
    const end = new Date(l.end_date);
    return end >= today && end <= cutoff;
  })
    .map(leaseToFull)
    .sort((a, b) => a.end_date.localeCompare(b.end_date));
}

function currentPeriodMonth() {
  return "2026-05-01";
}

export function demoGetCurrentMonthRentStatus(): RentStatusRow[] {
  const period = currentPeriodMonth();
  const rows = DEMO_RENT_PAYMENTS.filter((p) => p.period_month === period);
  return rows.map((p) => {
    const lease = DEMO_LEASES.find((l) => l.id === p.lease_id)!;
    return { ...p, lease: leaseToFull(lease) };
  });
}

export function demoGetRentHistoryForLease(leaseId: string): RentPayment[] {
  return DEMO_RENT_PAYMENTS.filter((p) => p.lease_id === leaseId).sort(
    (a, b) => b.period_month.localeCompare(a.period_month),
  );
}

export function demoGetExpenses(
  filters: ExpenseFilters = {},
): ExpenseWithProperty[] {
  return DEMO_EXPENSES.filter((e) => {
    if (filters.propertyId && e.property_id !== filters.propertyId) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (filters.startDate && e.expense_date < filters.startDate) return false;
    if (filters.endDate && e.expense_date > filters.endDate) return false;
    return true;
  })
    .map((e) => {
      const property = propertyById.get(e.property_id)!;
      return { ...e, property: { id: property.id, nickname: property.nickname } };
    })
    .sort((a, b) => b.expense_date.localeCompare(a.expense_date));
}

export function demoGetDashboardData(): DashboardData {
  const period = currentPeriodMonth();
  const rentStatus = demoGetCurrentMonthRentStatus();
  const expiringLeases = demoGetExpiringLeases(90);
  const recentExpenses = demoGetExpenses().slice(0, 5);
  const totalUnits = DEMO_UNITS.length;
  const occupiedUnits = DEMO_LEASES.filter((l) => l.status === "active").length;
  const rentDue = rentStatus.reduce((s, r) => s + Number(r.amount_due), 0);
  const rentCollected = rentStatus.reduce(
    (s, r) => s + Number(r.amount_paid),
    0,
  );
  const expenses = DEMO_EXPENSES.filter(
    (e) => e.expense_date >= period,
  ).reduce((s, e) => s + Number(e.amount), 0);
  return {
    summary: {
      totalUnits,
      occupiedUnits,
      rentDue,
      rentCollected,
      expenses,
      net: rentCollected - expenses,
    },
    rentStatus,
    expiringLeases,
    recentExpenses,
  };
}

export function demoGetPropertyFinancials(
  propertyId: string,
  yyyymm: string,
): PropertyFinancials {
  const first = `${yyyymm}-01`;
  const [y, m] = yyyymm.split("-").map(Number);
  const lastDate = new Date(y, m, 0);
  const last = `${yyyymm}-${String(lastDate.getDate()).padStart(2, "0")}`;
  const monthLabel = new Date(`${first}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const propertyUnitIds = (unitsByProperty.get(propertyId) ?? []).map((u) => u.id);
  const leaseIds = new Set(
    DEMO_LEASES.filter((l) => propertyUnitIds.includes(l.unit_id)).map(
      (l) => l.id,
    ),
  );
  const rent = DEMO_RENT_PAYMENTS.filter(
    (p) => leaseIds.has(p.lease_id) && p.period_month === first,
  );
  const rentDue = rent.reduce((s, r) => s + Number(r.amount_due), 0);
  const rentCollected = rent.reduce((s, r) => s + Number(r.amount_paid), 0);

  const exps = DEMO_EXPENSES.filter(
    (e) =>
      e.property_id === propertyId &&
      e.expense_date >= first &&
      e.expense_date <= last,
  );
  const byMap = new Map<string, number>();
  exps.forEach((e) => {
    byMap.set(e.category, (byMap.get(e.category) ?? 0) + Number(e.amount));
  });
  const byCategory = Array.from(byMap.entries())
    .map(([category, amount]) => ({
      category: category as keyof typeof CATEGORY_LABELS,
      label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
  const expensesTotal = byCategory.reduce((s, c) => s + c.amount, 0);

  return {
    monthLabel,
    rentCollected,
    rentDue,
    expenses: expensesTotal,
    net: rentCollected - expensesTotal,
    byCategory,
  };
}

export function demoExportFinancialsCSV(
  propertyId: string,
  yyyymm: string,
): string {
  const fin = demoGetPropertyFinancials(propertyId, yyyymm);
  const lines = [
    `# Demo export — ${propertyById.get(propertyId)?.nickname ?? propertyId} — ${fin.monthLabel}`,
    "Date,Type,Category,Vendor/Tenant,Amount",
    `${yyyymm}-01,Rent,Rent,Demo tenant,${fin.rentCollected.toFixed(2)}`,
    ...fin.byCategory.map(
      (c) => `${yyyymm}-01,Expense,${c.label},Demo vendor,${(-c.amount).toFixed(2)}`,
    ),
  ];
  return lines.join("\n");
}
