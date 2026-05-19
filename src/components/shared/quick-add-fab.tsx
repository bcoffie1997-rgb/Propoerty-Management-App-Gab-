"use client";

import { useRouter, usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Mobile-only floating action button.
 * - Add Expense: if on /expenses or a property page, fires a window event that
 *   the page listens for. Otherwise routes to /expenses?add=1.
 * - Mark Rent Paid: routes to / (dashboard rent table is the source of truth).
 */
export function QuickAddFab() {
  const router = useRouter();
  const pathname = usePathname();

  function onAddExpense() {
    if (pathname.startsWith("/expenses") || pathname.startsWith("/properties/")) {
      window.dispatchEvent(new CustomEvent("holdings:add-expense"));
    } else {
      router.push("/expenses?add=1");
    }
  }

  function onMarkRentPaid() {
    router.push("/#rent-status");
  }

  function onAddIssue() {
    router.push("/issues");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Quick add"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2">
          <DropdownMenuItem onSelect={onAddIssue}>Add Issue</DropdownMenuItem>
          <DropdownMenuItem onSelect={onAddExpense}>
            Add Expense
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onMarkRentPaid}>
            Mark Rent Paid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
