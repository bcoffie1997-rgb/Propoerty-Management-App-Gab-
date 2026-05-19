"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, addYears, format } from "date-fns";
import { toast } from "sonner";

import { renewLease } from "@/lib/actions/leases";
import type { Lease } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RenewLeaseDialog({
  lease,
  trigger,
}: {
  lease: Lease;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const newStart = format(addDays(new Date(lease.end_date), 1), "yyyy-MM-dd");
  const [newEndDate, setNewEndDate] = useState(() =>
    format(addYears(new Date(newStart), 1), "yyyy-MM-dd"),
  );
  const [newRent, setNewRent] = useState(String(lease.monthly_rent));
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const rent = parseFloat(newRent);
      if (Number.isNaN(rent) || rent <= 0) {
        throw new Error("Enter a valid rent amount");
      }
      await renewLease({
        leaseId: lease.id,
        newEndDate,
        newMonthlyRent: rent,
      });
      toast.success("Lease renewed");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Renew failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew lease</DialogTitle>
          <DialogDescription>
            New lease starts {newStart} (day after current end).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="renew-end">New end date</Label>
            <Input
              id="renew-end"
              type="date"
              value={newEndDate}
              min={newStart}
              onChange={(e) => setNewEndDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="renew-rent">Monthly rent</Label>
            <Input
              id="renew-rent"
              inputMode="decimal"
              value={newRent}
              onChange={(e) => setNewRent(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Renewing..." : "Renew"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
