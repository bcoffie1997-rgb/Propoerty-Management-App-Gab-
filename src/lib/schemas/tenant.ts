import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === "" ? null : v.trim()));

export const tenantSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : v))
    .pipe(z.string().email("Invalid email").nullable().optional())
    .transform((v) => v ?? null),
  phone: optionalString,
  emergency_contact: optionalString,
  notes: optionalString,
});

export type TenantInput = z.input<typeof tenantSchema>;
export type TenantValues = z.output<typeof tenantSchema>;
