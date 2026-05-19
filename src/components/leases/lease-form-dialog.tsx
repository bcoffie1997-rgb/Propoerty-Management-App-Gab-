"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { posthog } from "@/components/shared/posthog-provider";
import { leaseSchema, type LeaseInput } from "@/lib/schemas/lease";
import { createLease } from "@/lib/actions/leases";
import type { Tenant, Unit } from "@/types/database";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantFormDialog } from "@/components/tenants/tenant-form-dialog";

export function LeaseFormDialog({
  units,
  tenants,
  defaultUnitId,
  trigger,
}: {
  units: Unit[];
  tenants: Tenant[];
  defaultUnitId?: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [tenantOptions, setTenantOptions] = useState<Tenant[]>(tenants);

  useEffect(() => setTenantOptions(tenants), [tenants]);

  const defaults: LeaseInput = useMemo(
    () => ({
      unit_id: defaultUnitId ?? (units.length === 1 ? units[0].id : ""),
      tenant_id: "",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      )
        .toISOString()
        .slice(0, 10),
      monthly_rent: "" as unknown as number,
      deposit_amount: "" as unknown as number,
      rent_due_day: 1,
      notes: "",
    }),
    [units, defaultUnitId],
  );

  const form = useForm<LeaseInput>({
    resolver: zodResolver(leaseSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: LeaseInput) {
    try {
      await createLease(values);
      posthog.capture("lease_created");
      toast.success("Lease created");
      setOpen(false);
      form.reset(defaults);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create lease");
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) form.reset(defaults);
        }}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New lease</DialogTitle>
            <DialogDescription>
              Rent rows for the lease term will auto-generate.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.unit_label}
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Tenant</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setTenantDialogOpen(true)}
                      >
                        <Plus className="mr-0.5 h-3 w-3" />
                        New tenant
                      </Button>
                    </div>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tenantOptions.length === 0 ? (
                          <div className="py-2 text-center text-xs text-muted-foreground">
                            No tenants yet. Add one above.
                          </div>
                        ) : (
                          tenantOptions.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.first_name} {t.last_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="monthly_rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly rent</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          placeholder="0.00"
                          {...field}
                          value={field.value as unknown as string}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deposit_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit (optional)</FormLabel>
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
              </div>
              <FormField
                control={form.control}
                name="rent_due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent due day (1–28)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        {...field}
                        value={field.value as unknown as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Create lease
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <TenantFormDialog
        open={tenantDialogOpen}
        onOpenChange={setTenantDialogOpen}
        onCreated={(t) => {
          setTenantOptions((prev) => [...prev, t]);
          form.setValue("tenant_id", t.id);
        }}
      />
    </>
  );
}
