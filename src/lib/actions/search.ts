"use server";

import { getSessionContext } from "@/lib/auth";
import { DEMO_MODE, demoSearchAll } from "@/lib/demo-data";

export type SearchResult = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  category: "Property" | "Tenant" | "Issue" | "Vendor";
};

export type SearchResults = {
  properties: SearchResult[];
  tenants: SearchResult[];
  issues: SearchResult[];
  vendors: SearchResult[];
};

export async function searchAll(query: string): Promise<SearchResults> {
  if (!query.trim()) {
    return { properties: [], tenants: [], issues: [], vendors: [] };
  }
  if (DEMO_MODE) return demoSearchAll(query);

  const { supabase } = await getSessionContext();
  const q = `%${query.trim()}%`;

  const [
    { data: properties },
    { data: tenants },
    { data: issues },
    { data: vendors },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("id, nickname, address_line1, city")
      .or(`nickname.ilike.${q},address_line1.ilike.${q},city.ilike.${q}`)
      .limit(5),
    supabase
      .from("tenants")
      .select("id, first_name, last_name, email, phone")
      .or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q}`)
      .limit(5),
    supabase
      .from("maintenance_issues")
      .select("id, title, description")
      .or(`title.ilike.${q},description.ilike.${q}`)
      .limit(5),
    supabase
      .from("vendors")
      .select("id, name, category, contact_name")
      .or(`name.ilike.${q},contact_name.ilike.${q}`)
      .eq("active", true)
      .limit(5),
  ]);

  return {
    properties:
      properties?.map((p) => ({
        id: p.id,
        label: p.nickname,
        sublabel: `${p.address_line1}, ${p.city}`,
        href: `/properties/${p.id}`,
        category: "Property",
      })) ?? [],
    tenants:
      tenants?.map((t) => ({
        id: t.id,
        label: `${t.first_name} ${t.last_name}`,
        sublabel: t.email ?? t.phone ?? undefined,
        href: `/tenants/${t.id}`,
        category: "Tenant",
      })) ?? [],
    issues:
      issues?.map((i) => ({
        id: i.id,
        label: i.title,
        sublabel: i.description ?? undefined,
        href: `/issues`,
        category: "Issue",
      })) ?? [],
    vendors:
      vendors?.map((v) => ({
        id: v.id,
        label: v.name,
        sublabel: v.contact_name ?? undefined,
        href: `/vendors`,
        category: "Vendor",
      })) ?? [],
  };
}
