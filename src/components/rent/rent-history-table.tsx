import { format, parseISO } from "date-fns";

import type { RentPayment } from "@/types/database";
import { MoneyCell } from "@/components/shared/money-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";

export function RentHistoryTable({
  payments,
  actionRender,
  emptyTitle = "No rent history.",
}: {
  payments: RentPayment[];
  actionRender?: (p: RentPayment) => React.ReactNode;
  emptyTitle?: string;
}) {
  if (payments.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Paid date</TableHead>
          <TableHead>Status</TableHead>
          {actionRender && <TableHead className="w-[1%]" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs tabular-nums">
              {format(parseISO(p.period_month), "MMM yyyy")}
            </TableCell>
            <TableCell>
              <MoneyCell amount={p.amount_due} />
            </TableCell>
            <TableCell>
              <MoneyCell
                amount={p.amount_paid}
                emphasis={p.amount_paid > 0 ? "positive" : "muted"}
              />
            </TableCell>
            <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
              {p.paid_date ? format(parseISO(p.paid_date), "MMM d") : "—"}
            </TableCell>
            <TableCell>
              <StatusBadge status={p.status} />
            </TableCell>
            {actionRender && (
              <TableCell className="text-right">{actionRender(p)}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
