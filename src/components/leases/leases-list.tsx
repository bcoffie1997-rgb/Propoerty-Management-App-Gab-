"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";

import type { LeaseFull } from "@/lib/actions/leases";
import type { Tenant, Unit } from "@/types/database";
import { Button } from "@/components/ui/button";
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
import { LeaseFormDialog } from "@/components/leases/lease-form-dialog";
import { LeaseDetailDrawer } from "@/components/leases/lease-detail-drawer";

export function LeasesList({
  leases,
  units,
  tenants,
  defaultUnitId,
  showProperty = false,
}: {
  leases: LeaseFull[];
  units: Unit[];
  tenants: Tenant[];
  defaultUnitId?: string;
  showProperty?: boolean;
}) {
  const [active, setActive] = useState<LeaseFull | null>(null);
  const [open, setOpen] = useState(false);

  function openLease(l: LeaseFull) {
    setActive(l);
    setOpen(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <LeaseFormDialog
          units={units}
          tenants={tenants}
          defaultUnitId={defaultUnitId}
          trigger={
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New lease
            </Button>
          }
        />
      </div>
      {leases.length === 0 ? (
        <EmptyState
          title="No leases yet."
          description="Add one to start tracking rent."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                {showProperty && <TableHead>Property</TableHead>}
                <TableHead>Unit</TableHead>
                <TableHead>Term</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leases.map((l) => (
                <TableRow
                  key={l.id}
                  className="cursor-pointer"
                  onClick={() => openLease(l)}
                >
                  <TableCell className="font-medium">
                    {l.tenant.first_name} {l.tenant.last_name}
                  </TableCell>
                  {showProperty && (
                    <TableCell className="text-xs text-muted-foreground">
                      {l.unit.property.nickname}
                    </TableCell>
                  )}
                  <TableCell className="text-xs text-muted-foreground">
                    {l.unit.unit_label}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {format(parseISO(l.start_date), "MMM yyyy")} →{" "}
                    {format(parseISO(l.end_date), "MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyCell amount={l.monthly_rent} showCents={false} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={l.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <LeaseDetailDrawer
        lease={active}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
