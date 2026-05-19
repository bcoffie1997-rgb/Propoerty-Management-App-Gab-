"use server";

import { revalidatePath } from "next/cache";

import { expenseSchema, type ExpenseInput } from "@/lib/schemas/expense";
import type { Expense, ExpenseCategory } from "@/types/database";
import {
  DEMO_MODE,
  assertNotDemo,
  demoGetExpenses,
} from "@/lib/demo-data";
import { getSessionContext } from "@/lib/auth";

const RECEIPT_BUCKET = "receipts";

async function requireUser() {
  return getSessionContext();
}

export type ExpenseFilters = {
  propertyId?: string;
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
};

export type ExpenseWithProperty = Expense & {
  property: { id: string; nickname: string };
};

export async function getExpenses(
  filters: ExpenseFilters = {},
): Promise<ExpenseWithProperty[]> {
  if (DEMO_MODE) return demoGetExpenses(filters);
  const { supabase } = await requireUser();
  let query = supabase
    .from("expenses")
    .select("*, property:properties(id, nickname)")
    .order("expense_date", { ascending: false });

  if (filters.propertyId) query = query.eq("property_id", filters.propertyId);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.startDate) query = query.gte("expense_date", filters.startDate);
  if (filters.endDate) query = query.lte("expense_date", filters.endDate);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as ExpenseWithProperty[]) ?? [];
}

export async function createExpense(input: ExpenseInput) {
  assertNotDemo("Logging an expense");
  const { supabase } = await requireUser();
  const parsed = expenseSchema.parse(input);
  const { data, error } = await supabase
    .from("expenses")
    .insert(parsed)
    .select("id, property_id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath(`/properties/${data.property_id}`);
  revalidatePath("/");
  return data;
}

export async function updateExpense(id: string, input: ExpenseInput) {
  assertNotDemo("Editing an expense");
  const { supabase } = await requireUser();
  const parsed = expenseSchema.parse(input);
  const { data, error } = await supabase
    .from("expenses")
    .update(parsed)
    .eq("id", id)
    .select("property_id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  if (data?.property_id) revalidatePath(`/properties/${data.property_id}`);
  revalidatePath("/");
}

export async function deleteExpense(id: string) {
  assertNotDemo("Deleting an expense");
  const { supabase } = await requireUser();
  const { data: existing } = await supabase
    .from("expenses")
    .select("property_id, receipt_url")
    .eq("id", id)
    .single();

  if (existing?.receipt_url) {
    await supabase.storage.from(RECEIPT_BUCKET).remove([existing.receipt_url]);
  }

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  if (existing?.property_id) revalidatePath(`/properties/${existing.property_id}`);
  revalidatePath("/");
}

export async function createSignedReceiptUrl(
  path: string,
): Promise<string | null> {
  if (DEMO_MODE) return null;
  const { supabase } = await requireUser();
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}
