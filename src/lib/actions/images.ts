"use server";

import { getSessionContext } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo-data";

const IMAGE_BUCKET = "receipts";

export async function createSignedImageUrl(
  path: string,
): Promise<string | null> {
  if (DEMO_MODE) return null;
  const { supabase } = await getSessionContext();
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}
