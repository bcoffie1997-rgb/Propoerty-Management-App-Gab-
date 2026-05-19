"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

import { getLeaseById, type LeaseDetail } from "@/lib/actions/leases";
import type { LeaseFull } from "@/lib/actions/leases";
import { daysUntil, formatAddress } from "@/lib/format";
import { MoneyCell } from "@/components/shared/money-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RentHistoryTable } from "@/components/rent/rent-history-table";
import { RenewLeaseDialog } from "@/components/leases/renew-lease-dialog";
import { TerminateLeaseButton } from "@/components/leases/terminate-lease-button";
import { Button } from "@/components/ui/button";
import { MarkRentPaidDialog } from "@/components/rent/mark-rent-paid-dialog";

export function LeaseDetailDrawer({
  lease,
  open,
  onOpenChange,
}: {
  lease: LeaseFull | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = useState<LeaseDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !lease) {
      setDetail(null);
      return;
    }
    setLoading(true);
    getLeaseById(lease.id)
      .then((d) => setDetail(d))
      .finally(() => setLoading(false));
  }, [open, lease]);

  if (!lease) return null;

  const days = daysUntil(lease.end_date);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle>
                {lease.tenant.first_name} {lease.tenant.last_name}
              </DrawerTitle>
              <DrawerDescription className="font-mono text-xs">
                {formatAddress(lease.unit.property)} · {lease.unit.unit_label}
              </DrawerDescription>
            </div>
            <StatusBadge status={lease.status} />
          </div>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Field label="Rent">
              <MoneyCell amount={lease.monthly_rent} />
            </Field>
            <Field label="Deposit">
              <MoneyCell amount={lease.deposit_amount} />
            </Field>
            <Field label="Due day">
              <span className="font-mono tabular-nums">
                {lease.rent_due_day}
              </span>
            </Field>
            <Field label="Term">
              <span className="font-mono text-xs tabular-nums">
                {format(parseISO(lease.start_date), "MMM d, yyyy")} →{" "}
                {format(parseISO(lease.end_date), "MMM d, yyyy")}
              </span>
              {lease.status === "active" && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {days >= 0
                    ? `${days} day${days === 1 ? "" : "s"} left`
                    : `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`}
                </div>
              )}
            </Field>
          </div>
          {lease.notes && (
            <>
              <Separator className="my-4" />
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Notes
                </div>
                <p className="whitespace-pre-wrap">{lease.notes}</p>
              </div>
            </>
          )}
          {lease.status === "active" && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                <RenewLeaseDialog
                  lease={lease}
                  trigger={
                    <Button variant="outline" size="sm">
                      Renew
                    </Button>
                  }
                />
                <TerminateLeaseButton leaseId={lease.id} />
              </div>
            </>
          )}
          <Separator className="my-4" />
          <h4 className="mb-2 text-sm font-medium">Rent history</h4>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <RentHistoryTable
              payments={detail?.rent_payments ?? []}
              actionRender={(p) =>
                p.status !== "paid" && lease.status === "active" ? (
                  <MarkRentPaidDialog
                    payment={p}
                    trigger={
                      <Button size="sm" variant="outline">
                        Mark paid
                      </Button>
                    }
                  />
                ) : null
              }
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
