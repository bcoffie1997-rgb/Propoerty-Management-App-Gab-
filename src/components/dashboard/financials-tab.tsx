"use client";

import { useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";

import {
  exportFinancialsCSV,
  getPropertyFinancials,
  type PropertyFinancials,
} from "@/lib/actions/financials";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MoneyCell } from "@/components/shared/money-cell";
import { MonthPicker } from "@/components/shared/month-picker";
import { EmptyState } from "@/components/shared/empty-state";

export function FinancialsTab({ propertyId }: { propertyId: string }) {
  const [yyyymm, setYyyymm] = useState(() => format(new Date(), "yyyy-MM"));
  const [data, setData] = useState<PropertyFinancials | null>(null);
  const [loading, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const result = await getPropertyFinancials(propertyId, yyyymm);
      setData(result);
    });
  }, [propertyId, yyyymm]);

  async function onExport() {
    setExporting(true);
    try {
      const csv = await exportFinancialsCSV(propertyId, yyyymm);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `holdings-${yyyymm}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker value={yyyymm} onChange={setYyyymm} />
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={exporting || !data}
        >
          <Download className="mr-1.5 h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>
      {loading || !data ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Rent collected"
            amount={data.rentCollected}
            hint={
              data.rentDue > data.rentCollected
                ? `of ${data.rentDue.toLocaleString("en-US", { style: "currency", currency: "USD" })} due`
                : "Full month"
            }
          />
          <ExpensesCard data={data} />
          <SummaryCard
            label="Net"
            amount={data.net}
            emphasis={data.net >= 0 ? "positive" : "negative"}
            hint={data.monthLabel}
          />
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  amount,
  hint,
  emphasis = "default",
}: {
  label: string;
  amount: number;
  hint?: string;
  emphasis?: "default" | "positive" | "negative";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl">
          <MoneyCell amount={amount} emphasis={emphasis} />
        </div>
        {hint && (
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ExpensesCard({ data }: { data: PropertyFinancials }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl">
          <MoneyCell amount={data.expenses} />
        </div>
        <Separator className="my-2" />
        {data.byCategory.length === 0 ? (
          <EmptyState title="None this month." />
        ) : (
          <ul className="space-y-1 text-sm">
            {data.byCategory.map((c) => (
              <li
                key={c.category}
                className="flex items-center justify-between"
              >
                <span className="text-muted-foreground">{c.label}</span>
                <MoneyCell amount={c.amount} className="text-sm" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
