"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  ShieldAlert,
  Wrench,
} from "lucide-react";

import type { LeaseFull } from "@/lib/actions/leases";
import type { RentStatusRow } from "@/lib/actions/rent";
import type { MaintenanceIssueWithRelations } from "@/lib/actions/issues";
import type { Vendor } from "@/types/database";
import { daysUntil, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionCards({
  rentStatus,
  expiringLeases,
  overdueIssues,
  expiringVendors,
}: {
  rentStatus: RentStatusRow[];
  expiringLeases: LeaseFull[];
  overdueIssues: MaintenanceIssueWithRelations[];
  expiringVendors: Vendor[];
}) {
  const overdueRent = rentStatus.filter(
    (r) => r.status === "late" || r.status === "unpaid",
  );
  const rentOwed = overdueRent.reduce(
    (s, r) => s + (r.amount_due - r.amount_paid),
    0,
  );
  const expiringSoon = expiringLeases.filter(
    (l) => daysUntil(l.end_date) <= 30,
  );

  const cards: {
    key: string;
    icon: React.ReactNode;
    title: string;
    count: number;
    detail?: string;
    href: string;
    variant: "danger" | "warning" | "info";
  }[] = [];

  if (overdueRent.length > 0) {
    cards.push({
      key: "rent",
      icon: <DollarSign className="h-4 w-4" />,
      title: `${overdueRent.length} unpaid rent`,
      count: overdueRent.length,
      detail: `${formatMoney(rentOwed, { showCents: false })} owed`,
      href: "#rent-status",
      variant: "danger",
    });
  }

  if (overdueIssues.length > 0) {
    cards.push({
      key: "issues",
      icon: <Wrench className="h-4 w-4" />,
      title: `${overdueIssues.length} overdue issue${overdueIssues.length === 1 ? "" : "s"}`,
      count: overdueIssues.length,
      href: "/issues",
      variant: "danger",
    });
  }

  if (expiringSoon.length > 0) {
    cards.push({
      key: "leases",
      icon: <Clock className="h-4 w-4" />,
      title: `${expiringSoon.length} lease${expiringSoon.length === 1 ? "" : "s"} expiring soon`,
      count: expiringSoon.length,
      href: "/tenants",
      variant: "warning",
    });
  }

  if (expiringVendors.length > 0) {
    cards.push({
      key: "vendors",
      icon: <ShieldAlert className="h-4 w-4" />,
      title: `${expiringVendors.length} vendor insurance${expiringVendors.length === 1 ? "" : "s"} expiring`,
      count: expiringVendors.length,
      href: "/vendors",
      variant: "warning",
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3",
            card.variant === "danger" &&
              "border-destructive/30 bg-destructive/10",
            card.variant === "warning" &&
              "border-orange-500/30 bg-orange-500/10",
            card.variant === "info" && "border-primary/30 bg-primary/10",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              card.variant === "danger" && "bg-destructive/20 text-destructive",
              card.variant === "warning" &&
                "bg-orange-500/20 text-orange-600",
              card.variant === "info" && "bg-primary/20 text-primary",
            )}
          >
            {card.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{card.title}</div>
            {card.detail && (
              <div className="text-xs text-muted-foreground">{card.detail}</div>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 px-2 text-xs"
            asChild
          >
            <Link href={card.href}>
              {card.key === "rent" ? "Collect" : "View"} →
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
