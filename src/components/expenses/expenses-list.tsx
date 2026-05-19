"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  CATEGORY_LABELS,
  expenseCategoryEnum,
} from "@/lib/schemas/expense";
import { deleteExpense } from "@/lib/actions/expenses";
import type { ExpenseWithProperty } from "@/lib/actions/expenses";
import { formatMoney } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/types/database";
import type { PropertyOption } from "@/components/shared/property-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyCell } from "@/components/shared/money-cell";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";
import { ReceiptLink } from "@/components/expenses/receipt-link";

export function ExpensesList({
  expenses,
  properties,
  defaultPropertyId,
  scopedToProperty = false,
  initialAddOpen = false,
}: {
  expenses: ExpenseWithProperty[];
  properties: PropertyOption[];
  defaultPropertyId?: string;
  scopedToProperty?: boolean;
  initialAddOpen?: boolean;
}) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState<string | undefined>(
    scopedToProperty ? defaultPropertyId : undefined,
  );
  const [category, setCategory] = useState<ExpenseCategory | undefined>();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(initialAddOpen);

  useEffect(() => {
    const onAdd = () => setQuickOpen(true);
    window.addEventListener("holdings:add-expense", onAdd);
    return () => window.removeEventListener("holdings:add-expense", onAdd);
  }, []);

  useEffect(() => {
    if (initialAddOpen && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("add")) {
        url.searchParams.delete("add");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [initialAddOpen]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (propertyId && e.property_id !== propertyId) return false;
      if (category && e.category !== category) return false;
      if (startDate && e.expense_date < startDate) return false;
      if (endDate && e.expense_date > endDate) return false;
      return true;
    });
  }, [expenses, propertyId, category, startDate, endDate]);

  const total = filtered.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0,
  );

  async function onDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {!scopedToProperty && (
          <div className="grid min-w-[10rem] flex-1 gap-1.5">
            <Label className="text-xs">Property</Label>
            <Select
              value={propertyId ?? "all"}
              onValueChange={(v) =>
                setPropertyId(v === "all" ? undefined : v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nickname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid min-w-[8rem] gap-1.5">
          <Label className="text-xs">Category</Label>
          <Select
            value={category ?? "all"}
            onValueChange={(v) =>
              setCategory(v === "all" ? undefined : (v as ExpenseCategory))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {expenseCategoryEnum.options.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="exp-start" className="text-xs">
            From
          </Label>
          <Input
            id="exp-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[10rem]"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="exp-end" className="text-xs">
            To
          </Label>
          <Input
            id="exp-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[10rem]"
          />
        </div>
        <div className="ml-auto">
          <ExpenseFormDialog
            properties={properties}
            defaultPropertyId={defaultPropertyId}
            open={quickOpen}
            onOpenChange={setQuickOpen}
            trigger={
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Add expense
              </Button>
            }
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses logged."
          description={
            expenses.length === 0
              ? "Probably wrong. Log mortgage, insurance, and any repair you remember."
              : "Adjust the filters or log one."
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[7rem]">Date</TableHead>
                {!scopedToProperty && <TableHead>Property</TableHead>}
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[8rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <ExpenseRow
                  key={e.id}
                  expense={e}
                  expanded={expanded === e.id}
                  scopedToProperty={scopedToProperty}
                  onToggle={() =>
                    setExpanded((x) => (x === e.id ? null : e.id))
                  }
                  onEdit={() => {
                    setEditing(e);
                    setEditOpen(true);
                  }}
                  onDelete={() => onDelete(e.id)}
                />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={scopedToProperty ? 3 : 4}
                  className="text-right text-xs uppercase text-muted-foreground"
                >
                  Total
                </TableCell>
                <TableCell className="text-right">
                  <MoneyCell amount={total} />
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}

      {editing && (
        <ExpenseFormDialog
          expense={editing}
          properties={properties}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ExpenseRow({
  expense,
  expanded,
  scopedToProperty,
  onToggle,
  onEdit,
  onDelete,
}: {
  expense: ExpenseWithProperty;
  expanded: boolean;
  scopedToProperty: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={onToggle}
        data-state={expanded ? "selected" : undefined}
      >
        <TableCell className="font-mono text-xs tabular-nums">
          {format(parseISO(expense.expense_date), "MMM d, yyyy")}
        </TableCell>
        {!scopedToProperty && (
          <TableCell className="text-sm">
            <Link
              href={`/properties/${expense.property.id}`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {expense.property.nickname}
            </Link>
          </TableCell>
        )}
        <TableCell>
          <Badge variant="outline" className="capitalize">
            {CATEGORY_LABELS[expense.category]}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {expense.vendor ?? "—"}
        </TableCell>
        <TableCell className="text-right">
          <MoneyCell amount={expense.amount} />
        </TableCell>
        <TableCell className="text-right">
          <div
            className="flex justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {expense.receipt_url && <ReceiptLink path={expense.receipt_url} />}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onDelete}
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded && expense.description && (
        <TableRow data-state="selected">
          <TableCell
            colSpan={scopedToProperty ? 5 : 6}
            className="bg-muted/30 text-sm"
          >
            <span className="text-muted-foreground">{expense.description}</span>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
