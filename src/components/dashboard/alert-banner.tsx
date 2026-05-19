import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

import type { LeaseFull } from "@/lib/actions/leases";
import type { RentStatusRow } from "@/lib/actions/rent";
import { daysUntil } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AlertBanner({
  rentStatus,
  expiringLeases,
}: {
  rentStatus: RentStatusRow[];
  expiringLeases: LeaseFull[];
}) {
  const overdue = rentStatus.filter(
    (r) => r.status === "late" || r.status === "unpaid",
  );
  const expiringSoon = expiringLeases.filter(
    (l) => daysUntil(l.end_date) <= 30,
  );

  if (overdue.length === 0 && expiringSoon.length === 0) return null;

  return (
    <div className="space-y-2">
      {overdue.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">{overdue.length}</span> unpaid /
            overdue rent {overdue.length === 1 ? "payment" : "payments"} this
            month.{" "}
            <Link href="#rent-status" className="underline underline-offset-2">
              See details
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}
      {expiringSoon.length > 0 && (
        <Alert variant="warning">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">{expiringSoon.length}</span> lease
            {expiringSoon.length === 1 ? "" : "s"} expiring within 30 days.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
