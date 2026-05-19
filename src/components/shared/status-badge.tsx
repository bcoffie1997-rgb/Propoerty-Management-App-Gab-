import { Badge } from "@/components/ui/badge";

type RentStatus = "paid" | "partial" | "late" | "unpaid";
type LeaseStatus = "active" | "expired" | "terminated";
type ExpiryStatus = "expiring" | "ok";
type IssueStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "closed";
type IssuePriority = "low" | "medium" | "high" | "urgent";

export type AnyStatus =
  | RentStatus
  | LeaseStatus
  | ExpiryStatus
  | IssueStatus
  | IssuePriority;

const variantMap: Record<
  AnyStatus,
  "success" | "warning" | "danger" | "muted" | "outline"
> = {
  paid: "success",
  active: "success",
  ok: "success",
  partial: "warning",
  expiring: "warning",
  assigned: "warning",
  in_progress: "warning",
  medium: "warning",
  unpaid: "muted",
  new: "muted",
  on_hold: "muted",
  low: "muted",
  late: "danger",
  high: "danger",
  urgent: "danger",
  expired: "muted",
  terminated: "muted",
  completed: "success",
  closed: "outline",
};

const labelMap: Record<AnyStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  late: "Late",
  unpaid: "Unpaid",
  active: "Active",
  expired: "Expired",
  terminated: "Terminated",
  expiring: "Expiring",
  ok: "OK",
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  closed: "Closed",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}
