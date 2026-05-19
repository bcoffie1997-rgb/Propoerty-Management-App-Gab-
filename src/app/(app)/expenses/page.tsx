import { getExpenses } from "@/lib/actions/expenses";
import { getProperties } from "@/lib/actions/properties";
import { ExpensesList } from "@/components/expenses/expenses-list";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: { add?: string };
}) {
  const [expenses, properties] = await Promise.all([
    getExpenses(),
    getProperties(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you&apos;ve spent on the portfolio.
        </p>
      </div>
      <ExpensesList
        expenses={expenses}
        properties={properties.map((p) => ({
          id: p.id,
          nickname: p.nickname,
        }))}
        initialAddOpen={searchParams?.add === "1"}
      />
    </div>
  );
}
