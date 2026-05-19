"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { markRentPaid, updateRentPayment } from "@/lib/actions/rent";
import { posthog } from "@/components/shared/posthog-provider";
import { formatMoney } from "@/lib/format";
import type { RentPayment } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAYMENT_METHODS = ["Cash", "Check", "Zelle", "Venmo", "ACH", "Other"];

export function MarkRentPaidDialog({
  payment,
  trigger,
}: {
  payment: RentPayment;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [paidDate, setPaidDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amountPaid, setAmountPaid] = useState(String(payment.amount_due));
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const amount = parseFloat(amountPaid);
      if (Number.isNaN(amount) || amount < 0) {
        throw new Error("Enter a valid amount");
      }
      if (amount >= payment.amount_due) {
        await markRentPaid({
          rentPaymentId: payment.id,
          paidDate,
          paymentMethod: paymentMethod || undefined,
          notes: notes || undefined,
        });
      } else {
        await updateRentPayment({
          rentPaymentId: payment.id,
          amountPaid: amount,
          paidDate: amount > 0 ? paidDate : null,
          paymentMethod: paymentMethod || undefined,
          notes: notes || undefined,
        });
      }
      posthog.capture("rent_marked_paid", {
        partial: parseFloat(amountPaid) < payment.amount_due,
      });
      toast.success("Rent recorded");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record rent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark rent paid</DialogTitle>
          <DialogDescription className="font-mono text-xs tabular-nums">
            {format(parseISO(payment.period_month), "MMMM yyyy")} ·{" "}
            {formatMoney(payment.amount_due)} due
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="paid-amount">Amount paid</Label>
            <Input
              id="paid-amount"
              inputMode="decimal"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Less than {formatMoney(payment.amount_due)} marks as partial.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="paid-date">Paid date</Label>
            <Input
              id="paid-date"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="paid-method">Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paid-method">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="paid-notes">Notes (optional)</Label>
            <Textarea
              id="paid-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
