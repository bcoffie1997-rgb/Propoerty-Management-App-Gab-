"use server";

import { revalidatePath } from "next/cache";

import {
  propertySchema,
  type PropertyInput,
} from "@/lib/schemas/property";
import type { Property, Unit } from "@/types/database";
import {
  DEMO_MODE,
  assertNotDemo,
  demoGetProperties,
  demoGetPropertyById,
} from "@/lib/demo-data";
import { getSessionContext } from "@/lib/auth";

async function requireUser() {
  return getSessionContext();
}

export async function getProperties(): Promise<Property[]> {
  if (DEMO_MODE) return demoGetProperties();
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("nickname", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPropertyById(
  id: string,
): Promise<{ property: Property; units: Unit[] } | null> {
  if (DEMO_MODE) return demoGetPropertyById(id);
  const { supabase } = await requireUser();
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !property) return null;
  const { data: units } = await supabase
    .from("units")
    .select("*")
    .eq("property_id", id)
    .order("unit_label");
  return { property, units: units ?? [] };
}

export async function createProperty(input: PropertyInput) {
  assertNotDemo("Adding a property");
  const { supabase, userId } = await requireUser();
  const parsed = propertySchema.parse(input);
  const { data, error } = await supabase
    .from("properties")
    .insert({ ...parsed, owner_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/properties");
  revalidatePath("/");
  return data;
}

export async function updateProperty(id: string, input: PropertyInput) {
  assertNotDemo("Editing a property");
  const { supabase } = await requireUser();
  const parsed = propertySchema.parse(input);
  const { error } = await supabase
    .from("properties")
    .update(parsed)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  revalidatePath("/");
}

export async function deleteProperty(id: string) {
  assertNotDemo("Deleting a property");
  const { supabase } = await requireUser();
  const { data: activeLeases } = await supabase
    .from("leases")
    .select("id, unit:units!inner(property_id)")
    .eq("status", "active")
    .eq("unit.property_id", id);
  if (activeLeases && activeLeases.length > 0) {
    throw new Error(
      "Terminate or expire all active leases before deleting this property.",
    );
  }
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/properties");
  revalidatePath("/");
}
