import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === "" ? null : v.trim()));

const moneyRequired = z
  .union([z.string(), z.number()])
  .transform((v) => {
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isNaN(n) ? NaN : n;
  })
  .pipe(z.number().positive("Must be greater than zero"));

const moneyOptional = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isNaN(n) ? null : n;
  });

export const leaseSchema = z
  .object({
    unit_id: z.string().uuid("Pick a unit"),
    tenant_id: z.string().uuid("Pick a tenant"),
    start_date: z
      .string()
      .min(1, "Start date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    end_date: z
      .string()
      .min(1, "End date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    monthly_rent: moneyRequired,
    deposit_amount: moneyOptional,
    rent_due_day: z
      .union([z.string(), z.number()])
      .transform((v) =>
        typeof v === "string" ? parseInt(v, 10) : Math.trunc(v),
      )
      .pipe(z.number().int().min(1).max(28)),
    notes: optionalString,
  })
  .refine((v) => v.end_date > v.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type LeaseInput = z.input<typeof leaseSchema>;
export type LeaseValues = z.output<typeof leaseSchema>;
