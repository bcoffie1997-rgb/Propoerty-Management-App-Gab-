"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, UserCircle } from "lucide-react";
import { GlobalSearch } from "@/components/shared/global-search";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SignOutMenuItem } from "@/components/shared/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/tenants", label: "Tenants" },
  { href: "/issues", label: "Issues" },
  { href: "/vendors", label: "Vendors" },
  { href: "/expenses", label: "Expenses" },
  { href: "/settings", label: "Settings" },
  { href: "/changelog", label: "Changelog" },
];

export function NavBar({
  email,
  singleUserMode = false,
}: {
  email: string;
  singleUserMode?: boolean;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-mono text-base font-semibold tracking-tight text-foreground/95"
          >
            Santi Fortune
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border bg-card/70 p-1 md:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <GlobalSearch />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account menu">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </DropdownMenuLabel>
              {singleUserMode && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Single-user mode
                  </DropdownMenuLabel>
                </>
              )}
              <DropdownMenuSeparator />
              {!singleUserMode && <SignOutMenuItem />}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <MobileNav pathname={pathname} />
    </header>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex w-full overflow-x-auto border-t bg-background/70 md:hidden">
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 px-3 py-2 text-xs transition-colors",
              active
                ? "border-b-2 border-primary text-foreground"
                : "border-b-2 border-transparent text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
