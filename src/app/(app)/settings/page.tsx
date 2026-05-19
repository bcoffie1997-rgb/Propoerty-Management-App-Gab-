import { createClient } from "@/lib/supabase/server";
import { isSingleUserModeEnabled } from "@/lib/auth";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";

function initialsFor(email?: string | null) {
  if (!email) return "PM";
  const local = email.split("@")[0] ?? "";
  const initials = local
    .split(/[.\-_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || local.slice(0, 2).toUpperCase() || "PM";
}

export default async function SettingsPage() {
  const singleUserMode = isSingleUserModeEnabled();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email =
    user?.email ??
    (singleUserMode
      ? process.env.OWNER_EMAIL ??
        process.env.LOCAL_OWNER_EMAIL ??
        "owner@localhost"
      : "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile, appearance, and account.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            {singleUserMode
              ? "Single-user mode is active."
              : "Signed in with Google."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {initialsFor(email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Portfolio owner</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{email}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="truncate font-mono text-xs">
              {singleUserMode
                ? process.env.OWNER_ID ??
                  process.env.LOCAL_OWNER_ID ??
                  "Not configured"
                : (user?.id ?? "")}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Pick the interface theme for your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
