import { z } from "zod";

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isNaN(n) ? null : n;
  });

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === "" ? null : v.trim()));

export const propertyTypeEnum = z.enum([
  "single_family",
  "multi_family",
  "condo",
  "townhouse",
  "other",
]);

export const propertySchema = z.object({
  nickname: z.string().trim().min(1, "Nickname is required"),
  address_line1: z.string().trim().min(1, "Address is required"),
  address_line2: optionalString,
  city: z.string().trim().min(1, "City is required"),
  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(2, "Use the 2-letter state code")
    .transform((v) => v.toUpperCase()),
  zip: z.string().trim().min(5, "ZIP is required"),
  property_type: propertyTypeEnum.default("single_family"),
  purchase_date: optionalString,
  purchase_price: optionalNumber,
  current_value: optionalNumber,
  notes: optionalString,
});

export type PropertyInput = z.input<typeof propertySchema>;
export type PropertyValues = z.output<typeof propertySchema>;
