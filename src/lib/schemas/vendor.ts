import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === "" ? null : v.trim()));

export const vendorCategoryEnum = z.enum([
  "plumbing",
  "electrical",
  "hvac",
  "general_contractor",
  "handyman",
  "landscaping",
  "cleaning",
  "pest_control",
  "appliance",
  "other",
]);

export const VENDOR_CATEGORY_LABELS: Record<
  z.infer<typeof vendorCategoryEnum>,
  string
> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  general_contractor: "General Contractor",
  handyman: "Handyman",
  landscaping: "Landscaping",
  cleaning: "Cleaning",
  pest_control: "Pest Control",
  appliance: "Appliance",
  other: "Other",
};

export const vendorSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required"),
  category: vendorCategoryEnum.default("other"),
  contact_name: optionalString,
  email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  phone: optionalString,
  insurance_expiration: optionalString,
  notes: optionalString,
  image_url: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : null)),
  active: z.boolean().default(true),
});

export type VendorInput = z.input<typeof vendorSchema>;
