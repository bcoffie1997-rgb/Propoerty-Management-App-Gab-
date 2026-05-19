import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo-data";
import { NavBar } from "@/components/shared/nav-bar";
import { QuickAddFab } from "@/components/shared/quick-add-fab";
import { isSingleUserModeEnabled } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const singleUserMode = isSingleUserModeEnabled();
  let email = "demo@holdings.local";

  if (singleUserMode) {
    email =
      process.env.OWNER_EMAIL ??
      process.env.LOCAL_OWNER_EMAIL ??
      "owner@localhost";
  } else if (!DEMO_MODE) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    email = user.email ?? "";
  }

  return (
    <div className="min-h-screen bg-background/80">
      <NavBar email={email} singleUserMode={singleUserMode} />
      <main className="container mx-auto max-w-6xl px-4 py-6">{children}</main>
      <QuickAddFab />
    </div>
  );
}
