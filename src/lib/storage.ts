"use client";

import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE } from "@/lib/demo-data";

const MAX_IMAGE_MB = 10;
const PUBLIC_OWNER_ID =
  process.env.NEXT_PUBLIC_OWNER_ID ?? process.env.NEXT_PUBLIC_LOCAL_OWNER_ID;
const SINGLE_USER_MODE = process.env.NEXT_PUBLIC_SINGLE_USER_MODE === "1";

export async function uploadImage(
  file: File,
  bucket: string,
  prefix = "",
): Promise<string> {
  if (SINGLE_USER_MODE) {
    throw new Error(
      "Image upload requires login-backed storage. Disable single-user mode to upload images.",
    );
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_IMAGE_MB}MB`);
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = user?.id ?? PUBLIC_OWNER_ID;
  if (!ownerId) {
    throw new Error(
      DEMO_MODE
        ? "Uploads are disabled in demo mode."
        : "Missing owner ID for uploads.",
    );
  }
  const safe = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
  const path = `${ownerId}/${prefix}${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return path;
}
