"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  ISSUE_CATEGORY_LABELS,
  ISSUE_PRIORITY_LABELS,
} from "@/lib/schemas/issue";
import {
  deleteIssue,
  type MaintenanceIssueWithRelations,
} from "@/lib/actions/issues";
import type { Property, Tenant, Vendor } from "@/types/database";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyCell } from "@/components/shared/money-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueFormDialog } from "@/components/issues/issue-form-dialog";

function toOption<T extends { id: string }>(
  items: T[],
  makeLabel: (item: T) => string,
) {
  return items.map((item) => ({ id: item.id, label: makeLabel(item) }));
}

export function IssuesList({
  issues,
  properties,
  tenants,
  vendors,
}: {
  issues: MaintenanceIssueWithRelations[];
  properties: Property[];
  tenants: Tenant[];
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<MaintenanceIssueWithRelations | null>(null);

  const propertyOptions = useMemo(
    () => toOption(properties, (p) => p.nickname),
    [properties],
  );
  const tenantOptions = useMemo(
    () => toOption(tenants, (t) => `${t.first_name} ${t.last_name}`),
    [tenants],
  );

  const filtered = useMemo(
    () =>
      issues.filter((issue) => {
        if (propertyFilter !== "all" && issue.property_id !== propertyFilter) return false;
        if (statusFilter !== "all" && issue.status !== statusFilter) return false;
        return true;
      }),
    [issues, propertyFilter, statusFilter],
  );

  async function onDelete(id: string) {
    if (!confirm("Delete this issue?")) return;
    try {
      await deleteIssue(id);
      toast.success("Issue deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-[12rem] gap-1.5">
          <label className="text-xs text-muted-foreground">Property</label>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All properties</SelectItem>
              {propertyOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid min-w-[10rem] gap-1.5">
          <label className="text-xs text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <IssueFormDialog
            properties={propertyOptions}
            tenants={tenantOptions}
            vendors={vendors}
            trigger={
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Create issue
              </Button>
            }
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No issues logged."
          description="Good day, or no one has written things down yet."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="w-[7rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <div className="font-medium">{issue.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{ISSUE_CATEGORY_LABELS[issue.category]}</Badge>
                      {issue.tenant && (
                        <span>
                          {issue.tenant.first_name} {issue.tenant.last_name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{issue.property.nickname}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {issue.vendor?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={issue.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={issue.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {formatDate(issue.due_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyCell amount={issue.actual_cost} showCents={false} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditing(issue)}
                        aria-label="Edit issue"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => onDelete(issue.id)}
                        aria-label="Delete issue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && (
        <IssueFormDialog
          issue={editing}
          properties={propertyOptions}
          tenants={tenantOptions}
          vendors={vendors}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        />
      )}
    </div>
  );
}
