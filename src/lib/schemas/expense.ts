import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === "" ? null : v.trim()));

export const expenseCategoryEnum = z.enum([
  "mortgage",
  "tax",
  "insurance",
  "repair",
  "utility",
  "management",
  "hoa",
  "other",
]);

export const expenseSchema = z.object({
  property_id: z.string().uuid("Pick a property"),
  category: expenseCategoryEnum,
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => {
      const n = typeof v === "string" ? parseFloat(v) : v;
      return Number.isNaN(n) ? NaN : n;
    })
    .pipe(z.number().positive("Must be greater than zero")),
  expense_date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  vendor: optionalString,
  description: optionalString,
  receipt_url: optionalString,
  recurring: z.boolean().default(false),
});

export type ExpenseInput = z.input<typeof expenseSchema>;
export type ExpenseValues = z.output<typeof expenseSchema>;

export const CATEGORY_LABELS: Record<
  z.infer<typeof expenseCategoryEnum>,
  string
> = {
  mortgage: "Mortgage",
  tax: "Tax",
  insurance: "Insurance",
  repair: "Repair",
  utility: "Utility",
  management: "Management",
  hoa: "HOA",
  other: "Other",
};
