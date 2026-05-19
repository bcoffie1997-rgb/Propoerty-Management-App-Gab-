import Link from "next/link";
import { format, parseISO } from "date-fns";

import type { LeaseFull } from "@/lib/actions/leases";
import { daysUntil } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

function expiryVariant(days: number) {
  if (days < 0) return "danger";
  if (days <= 30) return "danger";
  if (days <= 60) return "warning";
  return "muted";
}

export function LeaseExpirationsCard({ leases }: { leases: LeaseFull[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lease expirations</CardTitle>
      </CardHeader>
      <CardContent>
        {leases.length === 0 ? (
          <EmptyState
            title="Nothing on the horizon."
            description="All active leases run past 90 days."
          />
        ) : (
          <ul className="divide-y">
            {leases.map((l) => {
              const days = daysUntil(l.end_date);
              return (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/tenants/${l.tenant.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {l.tenant.first_name} {l.tenant.last_name}
                    </Link>
                    <div className="truncate text-xs text-muted-foreground">
                      {l.unit.property.nickname} ·{" "}
                      <span className="font-mono tabular-nums">
                        {format(parseISO(l.end_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Badge variant={expiryVariant(days)}>
                    {days < 0 ? `${Math.abs(days)}d past` : `${days}d`}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
