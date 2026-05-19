import { getProperties } from "@/lib/actions/properties";
import { getExpenses } from "@/lib/actions/expenses";
import { ExpensesList } from "@/components/expenses/expenses-list";

export async function ExpensesTab({ propertyId }: { propertyId: string }) {
  const [expenses, properties] = await Promise.all([
    getExpenses({ propertyId }),
    getProperties(),
  ]);
  return (
    <ExpensesList
      expenses={expenses}
      properties={properties.map((p) => ({ id: p.id, nickname: p.nickname }))}
      defaultPropertyId={propertyId}
      scopedToProperty
    />
  );
}
