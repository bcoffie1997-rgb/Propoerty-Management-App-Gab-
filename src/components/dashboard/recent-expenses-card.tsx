import Link from "next/link";
import { format, parseISO } from "date-fns";

import type { ExpenseWithProperty } from "@/lib/actions/expenses";
import { CATEGORY_LABELS } from "@/lib/schemas/expense";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoneyCell } from "@/components/shared/money-cell";
import { EmptyState } from "@/components/shared/empty-state";

export function RecentExpensesCard({
  expenses,
}: {
  expenses: ExpenseWithProperty[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent expenses</CardTitle>
        <Link
          href="/expenses"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <EmptyState title="No expenses yet." />
        ) : (
          <ul className="divide-y">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm">
                    {e.vendor ?? CATEGORY_LABELS[e.category]}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {e.property.nickname} ·{" "}
                    <span className="font-mono tabular-nums">
                      {format(parseISO(e.expense_date), "MMM d")}
                    </span>
                  </div>
                </div>
                <MoneyCell amount={e.amount} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
