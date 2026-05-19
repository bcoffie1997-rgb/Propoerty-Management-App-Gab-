/**
 * Application-level TS shapes for our database tables.
 * Not auto-generated from Supabase — hand-rolled to stay readable and to
 * avoid a build-time codegen step. Keep in sync with supabase/migrations.
 */

export type PropertyType =
  | "single_family"
  | "multi_family"
  | "condo"
  | "townhouse"
  | "other";

export type ExpenseCategory =
  | "mortgage"
  | "tax"
  | "insurance"
  | "repair"
  | "utility"
  | "management"
  | "hoa"
  | "other";

export type LeaseStatus = "active" | "expired" | "terminated";
export type RentStatus = "paid" | "partial" | "late" | "unpaid";
export type VendorCategory =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "general_contractor"
  | "handyman"
  | "landscaping"
  | "cleaning"
  | "pest_control"
  | "appliance"
  | "other";
export type IssueCategory =
  | "repair"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "appliance"
  | "pest"
  | "turnover"
  | "inspection"
  | "other";
export type IssuePriority = "low" | "medium" | "high" | "urgent";
export type IssueStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "closed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  nickname: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  property_type: PropertyType;
  purchase_date: string | null;
  purchase_price: number | null;
  current_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_label: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  market_rent: number | null;
  notes: string | null;
  created_at: string;
}

export interface Tenant {
  id: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
}

export interface Lease {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number | null;
  deposit_held: boolean;
  rent_due_day: number;
  status: LeaseStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentPayment {
  id: string;
  lease_id: string;
  period_month: string;
  amount_due: number;
  amount_paid: number;
  paid_date: string | null;
  payment_method: string | null;
  status: RentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  property_id: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  vendor: string | null;
  description: string | null;
  receipt_url: string | null;
  recurring: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  owner_id: string;
  name: string;
  category: VendorCategory;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  insurance_expiration: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceIssue {
  id: string;
  property_id: string;
  tenant_id: string | null;
  vendor_id: string | null;
  title: string;
  description: string | null;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  reported_date: string;
  due_date: string | null;
  completed_date: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  invoice_ref: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
