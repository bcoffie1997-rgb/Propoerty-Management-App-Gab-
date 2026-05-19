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
  MaintenanceIssue,
  Property,
  RentPayment,
  Tenant,
  Unit,
  Vendor,
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
import type { MaintenanceIssueWithRelations } from "@/lib/actions/issues";

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

// =============================================================================
// PROPERTIES
// =============================================================================

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
    notes: "Duplex. Shared laundry in basement.",
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
  {
    id: "prop-maple",
    owner_id: OWNER,
    nickname: "321 Maple",
    address_line1: "321 Maple Dr",
    address_line2: null,
    city: "Denver",
    state: "CO",
    zip: "80205",
    property_type: "townhouse",
    purchase_date: "2021-04-20",
    purchase_price: 320000,
    current_value: 350000,
    notes: "New water heater installed 2025. Snow removal included in HOA.",
    created_at: "2021-04-20T00:00:00Z",
    updated_at: "2025-01-10T00:00:00Z",
  },
  {
    id: "prop-cedar",
    owner_id: OWNER,
    nickname: "555 Cedar",
    address_line1: "555 Cedar Ln",
    address_line2: null,
    city: "Nashville",
    state: "TN",
    zip: "37203",
    property_type: "single_family",
    purchase_date: "2023-02-14",
    purchase_price: 280000,
    current_value: 310000,
    notes: "Great rental history. Fenced yard, pet-friendly.",
    created_at: "2023-02-14T00:00:00Z",
    updated_at: "2024-08-05T00:00:00Z",
  },
  {
    id: "prop-birch",
    owner_id: OWNER,
    nickname: "888 Birch",
    address_line1: "888 Birch Blvd",
    address_line2: "Apt 4B",
    city: "Portland",
    state: "OR",
    zip: "97201",
    property_type: "multi_family",
    purchase_date: "2019-08-01",
    purchase_price: 520000,
    current_value: 580000,
    notes: "Four-plex. Recent exterior paint 2025. Coin laundry on-site.",
    created_at: "2019-08-01T00:00:00Z",
    updated_at: "2025-03-15T00:00:00Z",
  },
];

// =============================================================================
// UNITS
// =============================================================================

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
  {
    id: "unit-maple",
    property_id: "prop-maple",
    unit_label: "Main",
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1800,
    market_rent: 2400,
    notes: null,
    created_at: "2021-04-20T00:00:00Z",
  },
  {
    id: "unit-cedar",
    property_id: "prop-cedar",
    unit_label: "Main",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1550,
    market_rent: 1950,
    notes: null,
    created_at: "2023-02-14T00:00:00Z",
  },
  {
    id: "unit-birch",
    property_id: "prop-birch",
    unit_label: "Apt 4B",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 750,
    market_rent: 1400,
    notes: null,
    created_at: "2019-08-01T00:00:00Z",
  },
];

// =============================================================================
// TENANTS
// =============================================================================

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
  {
    id: "tenant-emily",
    owner_id: OWNER,
    first_name: "Emily",
    last_name: "Rodriguez",
    email: "emily.r@example.com",
    phone: "720-555-0322",
    emergency_contact: "Carlos Rodriguez — 720-555-0323",
    notes: "Has a service dog. Prefers text over calls.",
    created_at: "2024-11-01T00:00:00Z",
  },
  {
    id: "tenant-david",
    owner_id: OWNER,
    first_name: "David",
    last_name: "Thompson",
    email: "dthompson@example.com",
    phone: "615-555-0444",
    emergency_contact: "Lisa Thompson — 615-555-0445",
    notes: "Musician — practices drums in garage evenings.",
    created_at: "2024-09-15T00:00:00Z",
  },
  {
    id: "tenant-aisha",
    owner_id: OWNER,
    first_name: "Aisha",
    last_name: "Johnson",
    email: "aisha.j@example.com",
    phone: "503-555-0555",
    emergency_contact: "Maya Johnson — 503-555-0556",
    notes: "Travel nurse. Often away 3-4 days per week.",
    created_at: "2025-01-20T00:00:00Z",
  },
];

// =============================================================================
// LEASES
// =============================================================================

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
    notes: "Renewal conversation in July.",
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
  {
    id: "lease-emily",
    unit_id: "unit-maple",
    tenant_id: "tenant-emily",
    start_date: "2024-12-01",
    end_date: "2026-05-31",
    monthly_rent: 2400,
    deposit_amount: 2400,
    deposit_held: true,
    rent_due_day: 1,
    status: "active",
    notes: "Not renewing — moving out of state.",
    created_at: "2024-11-01T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
  },
  {
    id: "lease-david",
    unit_id: "unit-cedar",
    tenant_id: "tenant-david",
    start_date: "2024-10-01",
    end_date: "2026-10-01",
    monthly_rent: 1950,
    deposit_amount: 1950,
    deposit_held: true,
    rent_due_day: 1,
    status: "active",
    notes: "Wants to renew. Will discuss rate increase.",
    created_at: "2024-09-15T00:00:00Z",
    updated_at: "2024-10-01T00:00:00Z",
  },
  {
    id: "lease-aisha",
    unit_id: "unit-birch",
    tenant_id: "tenant-aisha",
    start_date: "2025-02-01",
    end_date: "2026-02-01",
    monthly_rent: 1400,
    deposit_amount: 1400,
    deposit_held: true,
    rent_due_day: 1,
    status: "active",
    notes: "Short-term lease. May extend month-to-month.",
    created_at: "2025-01-20T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
];

// =============================================================================
// RENT PAYMENTS
// =============================================================================

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
  // Emily — current unpaid
  rentRow("rp-emily-feb", "lease-emily", "2026-02-01", 2400, 2400, "2026-02-01", "paid", "Zelle"),
  rentRow("rp-emily-mar", "lease-emily", "2026-03-01", 2400, 2400, "2026-03-01", "paid", "Zelle"),
  rentRow("rp-emily-apr", "lease-emily", "2026-04-01", 2400, 2400, "2026-04-01", "paid", "Zelle"),
  rentRow("rp-emily-may", "lease-emily", "2026-05-01", 2400, 0, null, "unpaid"),
  // David — paid consistently
  rentRow("rp-david-feb", "lease-david", "2026-02-01", 1950, 1950, "2026-02-01", "paid", "Cash App"),
  rentRow("rp-david-mar", "lease-david", "2026-03-01", 1950, 1950, "2026-03-01", "paid", "Cash App"),
  rentRow("rp-david-apr", "lease-david", "2026-04-01", 1950, 1950, "2026-04-01", "paid", "Cash App"),
  rentRow("rp-david-may", "lease-david", "2026-05-01", 1950, 1950, "2026-05-01", "paid", "Cash App"),
  // Aisha — late payment history
  rentRow("rp-aisha-feb", "lease-aisha", "2026-02-01", 1400, 1400, "2026-02-05", "paid", "Venmo"),
  rentRow("rp-aisha-mar", "lease-aisha", "2026-03-01", 1400, 1400, "2026-03-08", "paid", "Venmo"),
  rentRow("rp-aisha-apr", "lease-aisha", "2026-04-01", 1400, 1400, "2026-04-10", "paid", "Venmo"),
  rentRow("rp-aisha-may", "lease-aisha", "2026-05-01", 1400, 0, null, "late"),
];

// =============================================================================
// EXPENSES
// =============================================================================

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
  {
    id: "exp-9",
    property_id: "prop-maple",
    category: "management",
    amount: 240,
    expense_date: "2026-05-01",
    vendor: "Denver PM Group",
    description: "Monthly management fee (10%)",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "exp-10",
    property_id: "prop-cedar",
    category: "insurance",
    amount: 110,
    expense_date: "2026-05-03",
    vendor: "Allstate",
    description: "Annual premium / 12",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-03T00:00:00Z",
  },
  {
    id: "exp-11",
    property_id: "prop-birch",
    category: "utility",
    amount: 340,
    expense_date: "2026-05-15",
    vendor: "Portland Water & Power",
    description: "Water, sewer, trash for common areas",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-15T00:00:00Z",
  },
  {
    id: "exp-12",
    property_id: "prop-maple",
    category: "repair",
    amount: 175,
    expense_date: "2026-05-08",
    vendor: "Mile High Handyman",
    description: "Fixed loose railing on front stairs.",
    receipt_url: null,
    recurring: false,
    created_at: "2026-05-08T00:00:00Z",
  },
  {
    id: "exp-13",
    property_id: "prop-cedar",
    category: "other",
    amount: 85,
    expense_date: "2026-05-06",
    vendor: "Nashville Lawn Pros",
    description: "Bi-weekly mowing and edging (landscaping)",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-06T00:00:00Z",
  },
  {
    id: "exp-14",
    property_id: "prop-birch",
    category: "repair",
    amount: 425,
    expense_date: "2026-04-28",
    vendor: "Rose City Electric",
    description: "Replaced faulty breaker panel in Unit 4B.",
    receipt_url: null,
    recurring: false,
    created_at: "2026-04-28T00:00:00Z",
  },
  {
    id: "exp-15",
    property_id: "prop-oak",
    category: "mortgage",
    amount: 1680,
    expense_date: "2026-05-01",
    vendor: "Wells Fargo",
    description: "Monthly P&I",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "exp-16",
    property_id: "prop-pine",
    category: "management",
    amount: 220,
    expense_date: "2026-05-01",
    vendor: "Austin Leasing Co",
    description: "Monthly management fee",
    receipt_url: null,
    recurring: true,
    created_at: "2026-05-01T00:00:00Z",
  },
];

// =============================================================================
// VENDORS
// =============================================================================

export const DEMO_VENDORS: Vendor[] = [
  {
    id: "vendor-garcia",
    owner_id: OWNER,
    name: "Garcia Plumbing",
    category: "plumbing",
    contact_name: "Miguel Garcia",
    email: "miguel@garciaplumbing.com",
    phone: "317-555-1001",
    insurance_expiration: "2026-12-31",
    notes: "Fast response. Great for emergencies.",
    image_url: null,
    active: true,
    created_at: "2023-01-15T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "vendor-bright",
    owner_id: OWNER,
    name: "Bright Spark Electric",
    category: "electrical",
    contact_name: "Lisa Nguyen",
    email: "lisa@brightsparkelec.com",
    phone: "773-555-2002",
    insurance_expiration: "2027-03-15",
    notes: "Licensed master electrician. Codes expert.",
    image_url: null,
    active: true,
    created_at: "2022-08-10T00:00:00Z",
    updated_at: "2025-01-20T00:00:00Z",
  },
  {
    id: "vendor-cool",
    owner_id: OWNER,
    name: "Cool Air HVAC",
    category: "hvac",
    contact_name: "James Patterson",
    email: "service@coolairhvac.com",
    phone: "512-555-3003",
    insurance_expiration: "2026-08-20",
    notes: "Annual maintenance plan available.",
    image_url: null,
    active: true,
    created_at: "2023-03-22T00:00:00Z",
    updated_at: "2024-09-10T00:00:00Z",
  },
  {
    id: "vendor-ace",
    owner_id: OWNER,
    name: "Ace Handyman Services",
    category: "handyman",
    contact_name: "Robert 'Ace' Miller",
    email: "ace@handymanservices.net",
    phone: "720-555-4004",
    insurance_expiration: "2026-11-30",
    notes: "Jack of all trades. Fair pricing.",
    image_url: null,
    active: true,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-11-15T00:00:00Z",
  },
  {
    id: "vendor-green",
    owner_id: OWNER,
    name: "Green Lawn Care",
    category: "landscaping",
    contact_name: "Tamara Brooks",
    email: "tamara@greenlawncare.com",
    phone: "615-555-5005",
    insurance_expiration: "2027-01-10",
    notes: "Seasonal contracts. Snow removal too.",
    image_url: null,
    active: true,
    created_at: "2023-05-18T00:00:00Z",
    updated_at: "2024-04-20T00:00:00Z",
  },
  {
    id: "vendor-pristine",
    owner_id: OWNER,
    name: "Pristine Cleaners",
    category: "cleaning",
    contact_name: "Sofia Martinez",
    email: "bookings@pristinecleaners.com",
    phone: "503-555-6006",
    insurance_expiration: "2026-09-25",
    notes: "Turnover specialists. Deep clean included.",
    image_url: null,
    active: true,
    created_at: "2022-11-30T00:00:00Z",
    updated_at: "2025-02-10T00:00:00Z",
  },
  {
    id: "vendor-bug",
    owner_id: OWNER,
    name: "Bug Busters",
    category: "pest_control",
    contact_name: "Derek Wilson",
    email: "derek@bugbusterspc.com",
    phone: "317-555-7007",
    insurance_expiration: "2026-07-14",
    notes: "Quarterly spray schedule. Pet-safe products.",
    image_url: null,
    active: true,
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-08-01T00:00:00Z",
  },
  {
    id: "vendor-rapid",
    owner_id: OWNER,
    name: "Rapid Appliance Repair",
    category: "appliance",
    contact_name: "Karen Olsen",
    email: "karen@rapidappliance.com",
    phone: "512-555-8008",
    insurance_expiration: "2027-05-01",
    notes: "Warranty work accepted. OEM parts only.",
    image_url: null,
    active: true,
    created_at: "2023-07-08T00:00:00Z",
    updated_at: "2025-01-05T00:00:00Z",
  },
  {
    id: "vendor-summit",
    owner_id: OWNER,
    name: "Summit General Contracting",
    category: "general_contractor",
    contact_name: "Chris Henderson",
    email: "chris@summitgc.com",
    phone: "720-555-9009",
    insurance_expiration: "2026-10-30",
    notes: "Full reno crew. Permits handled.",
    image_url: null,
    active: true,
    created_at: "2021-06-20T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
  },
  {
    id: "vendor-last",
    owner_id: OWNER,
    name: "Last Resort Repairs",
    category: "other",
    contact_name: "Unknown",
    email: null,
    phone: "555-0000",
    insurance_expiration: null,
    notes: "Avoid if possible. Expensive and slow.",
    image_url: null,
    active: false,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2023-06-15T00:00:00Z",
  },
];

// =============================================================================
// ISSUES
// =============================================================================

export const DEMO_ISSUES: MaintenanceIssue[] = [
  {
    id: "issue-1",
    property_id: "prop-oak",
    tenant_id: "tenant-marcus",
    vendor_id: "vendor-garcia",
    title: "Kitchen sink leak",
    description: "Water pooling under cabinet. Tenant noticed drip from trap.",
    category: "plumbing",
    priority: "high",
    status: "completed",
    reported_date: "2026-05-08",
    due_date: "2026-05-12",
    completed_date: "2026-05-10",
    estimated_cost: 350,
    actual_cost: 380,
    invoice_ref: "GP-2026-0542",
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-08T10:00:00Z",
    updated_at: "2026-05-10T14:00:00Z",
  },
  {
    id: "issue-2",
    property_id: "prop-main",
    tenant_id: "tenant-sarah",
    vendor_id: null,
    title: "HVAC not cooling upstairs",
    description: "Bedroom stays 5+ degrees warmer than thermostat setting.",
    category: "hvac",
    priority: "urgent",
    status: "assigned",
    reported_date: "2026-05-18",
    due_date: "2026-05-20",
    completed_date: null,
    estimated_cost: 400,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-18T08:30:00Z",
    updated_at: "2026-05-18T09:00:00Z",
  },
  {
    id: "issue-3",
    property_id: "prop-pine",
    tenant_id: null,
    vendor_id: "vendor-rapid",
    title: "Dishwasher not draining",
    description: "Standing water at bottom after cycle. Makes grinding noise.",
    category: "appliance",
    priority: "medium",
    status: "in_progress",
    reported_date: "2026-05-15",
    due_date: "2026-05-22",
    completed_date: null,
    estimated_cost: 200,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-15T16:00:00Z",
    updated_at: "2026-05-17T11:00:00Z",
  },
  {
    id: "issue-4",
    property_id: "prop-birch",
    tenant_id: "tenant-aisha",
    vendor_id: null,
    title: "Broken outlet in bathroom",
    description: "GFCI outlet tripped and will not reset. No power to vanity lights.",
    category: "electrical",
    priority: "high",
    status: "new",
    reported_date: "2026-05-19",
    due_date: "2026-05-21",
    completed_date: null,
    estimated_cost: 150,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-19T07:15:00Z",
    updated_at: "2026-05-19T07:15:00Z",
  },
  {
    id: "issue-5",
    property_id: "prop-cedar",
    tenant_id: "tenant-david",
    vendor_id: "vendor-bug",
    title: "Ants in kitchen",
    description: "Tenant reports sugar ants along baseboards near pantry.",
    category: "pest",
    priority: "medium",
    status: "assigned",
    reported_date: "2026-05-14",
    due_date: "2026-05-24",
    completed_date: null,
    estimated_cost: 120,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-14T13:00:00Z",
    updated_at: "2026-05-16T10:00:00Z",
  },
  {
    id: "issue-6",
    property_id: "prop-maple",
    tenant_id: "tenant-emily",
    vendor_id: "vendor-ace",
    title: "Front stair railing loose",
    description: "Top post wobbles. Safety concern for winter ice.",
    category: "repair",
    priority: "low",
    status: "completed",
    reported_date: "2026-05-05",
    due_date: "2026-05-10",
    completed_date: "2026-05-08",
    estimated_cost: 150,
    actual_cost: 175,
    invoice_ref: "ACE-2026-112",
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-05T09:00:00Z",
    updated_at: "2026-05-08T15:00:00Z",
  },
  {
    id: "issue-7",
    property_id: "prop-main",
    tenant_id: null,
    vendor_id: null,
    title: "Annual HVAC inspection",
    description: "Preventative maintenance per service agreement.",
    category: "inspection",
    priority: "low",
    status: "on_hold",
    reported_date: "2026-05-01",
    due_date: "2026-06-01",
    completed_date: null,
    estimated_cost: 180,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-10T00:00:00Z",
  },
  {
    id: "issue-8",
    property_id: "prop-oak",
    tenant_id: null,
    vendor_id: null,
    title: "Pre-move-out inspection",
    description: "Marcus lease ends 6/15. Schedule walkthrough 1 week prior.",
    category: "turnover",
    priority: "medium",
    status: "new",
    reported_date: "2026-05-19",
    due_date: "2026-06-08",
    completed_date: null,
    estimated_cost: 0,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-19T10:00:00Z",
    updated_at: "2026-05-19T10:00:00Z",
  },
  {
    id: "issue-9",
    property_id: "prop-birch",
    tenant_id: null,
    vendor_id: "vendor-summit",
    title: "Water damage ceiling repair",
    description: "Leak from upstairs unit caused stain and soft drywall in hallway.",
    category: "repair",
    priority: "high",
    status: "in_progress",
    reported_date: "2026-04-25",
    due_date: "2026-05-25",
    completed_date: null,
    estimated_cost: 1200,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-04-25T11:00:00Z",
    updated_at: "2026-05-05T14:00:00Z",
  },
  {
    id: "issue-10",
    property_id: "prop-pine",
    tenant_id: "tenant-jamie",
    vendor_id: null,
    title: "Garbage disposal jammed",
    description: "Tenant put citrus peels down disposal. Now humming but not spinning.",
    category: "plumbing",
    priority: "low",
    status: "closed",
    reported_date: "2026-04-10",
    due_date: "2026-04-15",
    completed_date: "2026-04-12",
    estimated_cost: 100,
    actual_cost: 85,
    invoice_ref: "GP-2026-0389",
    image_url: null,
    created_by: OWNER,
    created_at: "2026-04-10T14:00:00Z",
    updated_at: "2026-04-12T16:00:00Z",
  },
  {
    id: "issue-11",
    property_id: "prop-cedar",
    tenant_id: null,
    vendor_id: null,
    title: "Smoke detector chirping",
    description: "Hallway unit beeps every 30 seconds. Likely low battery.",
    category: "repair",
    priority: "medium",
    status: "new",
    reported_date: "2026-05-19",
    due_date: "2026-05-22",
    completed_date: null,
    estimated_cost: 25,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-19T11:30:00Z",
    updated_at: "2026-05-19T11:30:00Z",
  },
  {
    id: "issue-12",
    property_id: "prop-maple",
    tenant_id: null,
    vendor_id: "vendor-bright",
    title: "Flickering overhead lights",
    description: "Living room recessed lights flicker when dimmer above 70%.",
    category: "electrical",
    priority: "low",
    status: "on_hold",
    reported_date: "2026-05-12",
    due_date: "2026-05-26",
    completed_date: null,
    estimated_cost: 250,
    actual_cost: null,
    invoice_ref: null,
    image_url: null,
    created_by: OWNER,
    created_at: "2026-05-12T18:00:00Z",
    updated_at: "2026-05-15T09:00:00Z",
  },
];

// =============================================================================
// DERIVED HELPERS
// =============================================================================

const propertyById = new Map(DEMO_PROPERTIES.map((p) => [p.id, p]));
const unitsByProperty = new Map<string, Unit[]>();
DEMO_UNITS.forEach((u) => {
  const list = unitsByProperty.get(u.property_id) ?? [];
  list.push(u);
  unitsByProperty.set(u.property_id, list);
});
const unitById = new Map(DEMO_UNITS.map((u) => [u.id, u]));
const tenantById = new Map(DEMO_TENANTS.map((t) => [t.id, t]));
const vendorById = new Map(DEMO_VENDORS.map((v) => [v.id, v]));

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

// =============================================================================
// VENDORS & ISSUES
// =============================================================================

export function demoGetVendors(): Vendor[] {
  return DEMO_VENDORS;
}

export function demoGetIssues(): MaintenanceIssueWithRelations[] {
  return DEMO_ISSUES.map((issue) => {
    const property = propertyById.get(issue.property_id)!;
    const tenant = issue.tenant_id ? tenantById.get(issue.tenant_id) ?? null : null;
    const vendor = issue.vendor_id
      ? vendorById.get(issue.vendor_id) ?? null
      : null;
    return {
      ...issue,
      property: { id: property.id, nickname: property.nickname },
      tenant: tenant
        ? { id: tenant.id, first_name: tenant.first_name, last_name: tenant.last_name }
        : null,
      vendor: vendor
        ? { id: vendor.id, name: vendor.name, category: vendor.category }
        : null,
    };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
}
