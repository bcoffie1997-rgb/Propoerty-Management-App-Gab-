"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SINGLE_USER_MODE === "1") {
      router.replace("/");
    }
  }, [router]);

  if (process.env.NEXT_PUBLIC_SINGLE_USER_MODE === "1") return null;

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-mono text-2xl">Santi Fortune</CardTitle>
          <CardDescription>
            Internal property manager. Sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            {loading ? "Redirecting..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.494 12.275c0-.832-.075-1.633-.214-2.4H12v4.541h6.448a5.507 5.507 0 0 1-2.39 3.616v3.005h3.866c2.262-2.085 3.57-5.156 3.57-8.762Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.956-1.075 7.94-2.911l-3.866-3.005c-1.075.72-2.45 1.147-4.074 1.147-3.13 0-5.78-2.115-6.728-4.954H1.276v3.108A11.997 11.997 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.272 14.277A7.21 7.21 0 0 1 4.89 12c0-.79.137-1.56.382-2.277V6.615H1.276A12 12 0 0 0 0 12c0 1.937.464 3.768 1.276 5.385l3.996-3.108Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.766 0 3.35.607 4.598 1.797l3.43-3.43C17.953 1.19 15.238 0 12 0 7.39 0 3.416 2.643 1.276 6.615l3.996 3.108C6.22 6.885 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
