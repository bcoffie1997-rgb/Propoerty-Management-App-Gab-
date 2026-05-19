import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const SINGLE_USER_MODE = process.env.NEXT_PUBLIC_SINGLE_USER_MODE === "1";
const OWNER_ID = process.env.OWNER_ID ?? process.env.LOCAL_OWNER_ID ?? "";
const OWNER_EMAIL =
  process.env.OWNER_EMAIL ?? process.env.LOCAL_OWNER_EMAIL ?? "owner@localhost";

export function isSingleUserModeEnabled() {
  return SINGLE_USER_MODE;
}

function assertSingleUserEnv() {
  if (!OWNER_ID) {
    throw new Error(
      "OWNER_ID is required when NEXT_PUBLIC_SINGLE_USER_MODE=1.",
    );
  }
}

export async function getSessionContext() {
  if (SINGLE_USER_MODE) {
    assertSingleUserEnv();
    return {
      supabase: createServiceClient(),
      userId: OWNER_ID,
      email: OWNER_EMAIL,
      isSingleUserMode: true,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return {
    supabase,
    userId: user.id,
    email: user.email ?? "",
    isSingleUserMode: false,
  };
}
