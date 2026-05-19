"use server";

import { revalidatePath } from "next/cache";

import { getSessionContext } from "@/lib/auth";
import { vendorSchema, type VendorInput } from "@/lib/schemas/vendor";
import type { Vendor } from "@/types/database";
import { DEMO_MODE, assertNotDemo, demoGetVendors } from "@/lib/demo-data";

async function requireUser() {
  return getSessionContext();
}

export async function getVendors(): Promise<Vendor[]> {
  if (DEMO_MODE) return demoGetVendors();
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("active", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Vendor[]) ?? [];
}

export async function createVendor(input: VendorInput) {
  assertNotDemo("Adding a vendor");
  const { supabase, userId } = await requireUser();
  const parsed = vendorSchema.parse(input);
  const { data, error } = await supabase
    .from("vendors")
    .insert({ ...parsed, owner_id: userId })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/vendors");
  revalidatePath("/issues");
  return data as Vendor;
}

export async function updateVendor(id: string, input: VendorInput) {
  assertNotDemo("Editing a vendor");
  const { supabase } = await requireUser();
  const parsed = vendorSchema.parse(input);

  const { data: existing } = await supabase
    .from("vendors")
    .select("image_url")
    .eq("id", id)
    .single();

  if (existing?.image_url && existing.image_url !== parsed.image_url) {
    await supabase.storage.from("receipts").remove([existing.image_url]);
  }

  const { error } = await supabase.from("vendors").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vendors");
  revalidatePath("/issues");
}

export async function deleteVendor(id: string) {
  assertNotDemo("Deleting a vendor");
  const { supabase } = await requireUser();
  const { data: existing } = await supabase
    .from("vendors")
    .select("image_url")
    .eq("id", id)
    .single();

  if (existing?.image_url) {
    await supabase.storage.from("receipts").remove([existing.image_url]);
  }

  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vendors");
  revalidatePath("/issues");
}
