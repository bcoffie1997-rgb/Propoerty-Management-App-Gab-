import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === "" ? null : v.trim()));

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isNaN(n) ? null : n;
  });

export const issueCategoryEnum = z.enum([
  "repair",
  "plumbing",
  "electrical",
  "hvac",
  "appliance",
  "pest",
  "turnover",
  "inspection",
  "other",
]);

export const issuePriorityEnum = z.enum(["low", "medium", "high", "urgent"]);
export const issueStatusEnum = z.enum([
  "new",
  "assigned",
  "in_progress",
  "on_hold",
  "completed",
  "closed",
]);

export const ISSUE_CATEGORY_LABELS: Record<
  z.infer<typeof issueCategoryEnum>,
  string
> = {
  repair: "General Repair",
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  appliance: "Appliance",
  pest: "Pest Control",
  turnover: "Turnover",
  inspection: "Inspection",
  other: "Other",
};

export const ISSUE_PRIORITY_LABELS: Record<
  z.infer<typeof issuePriorityEnum>,
  string
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const issueSchema = z.object({
  property_id: z.string().uuid("Property is required"),
  tenant_id: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : null)),
  vendor_id: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : null)),
  title: z.string().trim().min(1, "Issue title is required"),
  description: optionalString,
  category: issueCategoryEnum.default("repair"),
  priority: issuePriorityEnum.default("medium"),
  status: issueStatusEnum.default("new"),
  reported_date: z.string().min(1, "Reported date is required"),
  due_date: optionalString,
  completed_date: optionalString,
  estimated_cost: optionalNumber,
  actual_cost: optionalNumber,
  invoice_ref: optionalString,
  image_url: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : null)),
});

export type IssueInput = z.input<typeof issueSchema>;
