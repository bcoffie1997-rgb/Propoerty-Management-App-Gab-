"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  ISSUE_CATEGORY_LABELS,
  ISSUE_PRIORITY_LABELS,
  issueCategoryEnum,
  issuePriorityEnum,
  issueSchema,
  issueStatusEnum,
  type IssueInput,
} from "@/lib/schemas/issue";
import { createIssue, updateIssue } from "@/lib/actions/issues";
import type { MaintenanceIssue, Vendor } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";

const issueStatusLabels: Record<(typeof issueStatusEnum.options)[number], string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  closed: "Closed",
};

type FormOption = { id: string; label: string };

function defaultsFor(issue?: MaintenanceIssue): IssueInput {
  return {
    property_id: issue?.property_id ?? "",
    tenant_id: issue?.tenant_id ?? "",
    vendor_id: issue?.vendor_id ?? "",
    title: issue?.title ?? "",
    description: issue?.description ?? "",
    category: issue?.category ?? "repair",
    priority: issue?.priority ?? "medium",
    status: issue?.status ?? "new",
    reported_date: issue?.reported_date ?? format(new Date(), "yyyy-MM-dd"),
    due_date: issue?.due_date ?? "",
    completed_date: issue?.completed_date ?? "",
    estimated_cost: issue?.estimated_cost ?? undefined,
    actual_cost: issue?.actual_cost ?? undefined,
    invoice_ref: issue?.invoice_ref ?? "",
  };
}

export function IssueFormDialog({
  issue,
  properties,
  tenants,
  vendors,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  issue?: MaintenanceIssue;
  properties: FormOption[];
  tenants: FormOption[];
  vendors: Vendor[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [vendorOptions, setVendorOptions] = useState(vendors);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    onOpenChange ? onOpenChange(next) : setInternalOpen(next);
  };
  const editing = !!issue;

  const form = useForm<IssueInput>({
    resolver: zodResolver(issueSchema),
    defaultValues: defaultsFor(issue),
  });

  async function onSubmit(values: IssueInput) {
    try {
      if (editing) {
        await updateIssue(issue.id, values);
        toast.success("Issue updated");
      } else {
        await createIssue(values);
        toast.success("Issue created");
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save issue");
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) form.reset(defaultsFor(issue));
        }}
      >
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit issue" : "Create issue"}</DialogTitle>
            <DialogDescription>
              Track maintenance from first report to final invoice.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="property_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tenant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant (optional)</FormLabel>
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No tenant</SelectItem>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue title</FormLabel>
                    <FormControl>
                      <Input placeholder="Kitchen sink leak in Unit A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="What happened and what has been tried?"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {issueCategoryEnum.options.map((category) => (
                            <SelectItem key={category} value={category}>
                              {ISSUE_CATEGORY_LABELS[category]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {issuePriorityEnum.options.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {ISSUE_PRIORITY_LABELS[priority]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {issueStatusEnum.options.map((status) => (
                            <SelectItem key={status} value={status}>
                              {issueStatusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="reported_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reported date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completed_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completed date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="estimated_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated cost</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          placeholder="0.00"
                          {...field}
                          value={(field.value as unknown as string) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actual_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual cost</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          placeholder="0.00"
                          {...field}
                          value={(field.value as unknown as string) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoice_ref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice ref</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="INV-8821"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Assigned vendor</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setVendorDialogOpen(true)}
                      >
                        <Plus className="mr-0.5 h-3 w-3" />
                        New vendor
                      </Button>
                    </div>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No vendor assigned</SelectItem>
                        {vendorOptions.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {editing ? "Save changes" : "Create issue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <VendorFormDialog
        open={vendorDialogOpen}
        onOpenChange={setVendorDialogOpen}
        onCreated={(vendor) => {
          setVendorOptions((prev) => [vendor, ...prev]);
          form.setValue("vendor_id", vendor.id);
        }}
      />
    </>
  );
}
