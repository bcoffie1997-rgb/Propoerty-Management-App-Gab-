import { format, parseISO } from "date-fns";
import Link from "next/link";

import type { RentStatusRow } from "@/lib/actions/rent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoneyCell } from "@/components/shared/money-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkRentPaidDialog } from "@/components/rent/mark-rent-paid-dialog";

export function RentStatusTable({ rows }: { rows: RentStatusRow[] }) {
  const monthLabel =
    rows.length > 0
      ? format(parseISO(rows[0].period_month), "MMMM yyyy")
      : format(new Date(), "MMMM yyyy");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Rent — {monthLabel}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Nothing to collect. Yet."
              description="Create a lease to start tracking rent."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[1%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">
                    <Link
                      href={`/properties/${r.lease.unit.property.id}`}
                      className="font-medium hover:underline"
                    >
                      {r.lease.unit.property.nickname}
                    </Link>
                    <span className="ml-1 text-xs text-muted-foreground">
                      · {r.lease.unit.unit_label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <Link
                      href={`/tenants/${r.lease.tenant.id}`}
                      className="hover:underline"
                    >
                      {r.lease.tenant.first_name} {r.lease.tenant.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <MoneyCell amount={r.amount_due} />
                    </div>
                    {r.amount_paid > 0 && r.amount_paid < r.amount_due && (
                      <div className="text-xs text-muted-foreground">
                        <MoneyCell amount={r.amount_paid} /> paid
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status !== "paid" ? (
                      <MarkRentPaidDialog
                        payment={r}
                        trigger={
                          <Button size="sm" variant="outline">
                            Mark paid
                          </Button>
                        }
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
