"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";

import { getSessionContext } from "@/lib/auth";
import { issueSchema, type IssueInput } from "@/lib/schemas/issue";
import type {
  MaintenanceIssue,
  Property,
  Tenant,
  Vendor,
} from "@/types/database";
import { DEMO_MODE, assertNotDemo } from "@/lib/demo-data";

async function requireUser() {
  return getSessionContext();
}

export type MaintenanceIssueWithRelations = MaintenanceIssue & {
  property: Pick<Property, "id" | "nickname">;
  tenant: Pick<Tenant, "id" | "first_name" | "last_name"> | null;
  vendor: Pick<Vendor, "id" | "name" | "category"> | null;
};

export async function getIssues(): Promise<MaintenanceIssueWithRelations[]> {
  if (DEMO_MODE) return [];
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("maintenance_issues")
    .select(
      "*, property:properties(id, nickname), tenant:tenants(id, first_name, last_name), vendor:vendors(id, name, category)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as MaintenanceIssueWithRelations[]) ?? [];
}

export async function createIssue(input: IssueInput) {
  assertNotDemo("Creating an issue");
  const { supabase, userId } = await requireUser();
  const parsed = issueSchema.parse(input);
  const { data, error } = await supabase
    .from("maintenance_issues")
    .insert({
      ...parsed,
      created_by: userId,
      completed_date:
        parsed.status === "completed" || parsed.status === "closed"
          ? parsed.completed_date ?? format(new Date(), "yyyy-MM-dd")
          : null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/issues");
  revalidatePath("/");
  return data as MaintenanceIssue;
}

export async function updateIssue(id: string, input: IssueInput) {
  assertNotDemo("Updating an issue");
  const { supabase } = await requireUser();
  const parsed = issueSchema.parse(input);
  const payload = {
    ...parsed,
    completed_date:
      parsed.status === "completed" || parsed.status === "closed"
        ? parsed.completed_date ?? format(new Date(), "yyyy-MM-dd")
        : null,
  };
  const { error } = await supabase
    .from("maintenance_issues")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/issues");
  revalidatePath("/");
}

export async function deleteIssue(id: string) {
  assertNotDemo("Deleting an issue");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("maintenance_issues").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/issues");
  revalidatePath("/");
}
