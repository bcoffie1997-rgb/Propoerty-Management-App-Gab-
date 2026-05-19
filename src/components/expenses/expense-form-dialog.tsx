"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

import {
  CATEGORY_LABELS,
  expenseSchema,
  type ExpenseInput,
} from "@/lib/schemas/expense";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { posthog } from "@/components/shared/posthog-provider";
import { createClient } from "@/lib/supabase/client";
import type { Expense } from "@/types/database";
import type { PropertyOption } from "@/components/shared/property-select";
import { DEMO_MODE } from "@/lib/demo-data";
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

const MAX_RECEIPT_MB = 10;
const SINGLE_USER_MODE = process.env.NEXT_PUBLIC_SINGLE_USER_MODE === "1";
const PUBLIC_OWNER_ID =
  process.env.NEXT_PUBLIC_OWNER_ID ?? process.env.NEXT_PUBLIC_LOCAL_OWNER_ID;

const defaultsFor = (
  expense?: Expense,
  defaultPropertyId?: string,
): ExpenseInput => ({
  property_id: expense?.property_id ?? defaultPropertyId ?? "",
  category: expense?.category ?? "repair",
  amount: expense?.amount ?? ("" as unknown as number),
  expense_date: expense?.expense_date ?? format(new Date(), "yyyy-MM-dd"),
  vendor: expense?.vendor ?? "",
  description: expense?.description ?? "",
  receipt_url: expense?.receipt_url ?? "",
  recurring: expense?.recurring ?? false,
});

export function ExpenseFormDialog({
  expense,
  properties,
  defaultPropertyId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  expense?: Expense;
  properties: PropertyOption[];
  defaultPropertyId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (o: boolean) => {
    onOpenChange ? onOpenChange(o) : setInternalOpen(o);
  };
  const editing = !!expense;
  const [uploading, setUploading] = useState(false);

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultsFor(expense, defaultPropertyId),
  });

  async function uploadReceipt(file: File): Promise<string> {
    if (SINGLE_USER_MODE) {
      throw new Error(
        "Receipt upload requires login-backed storage. Disable single-user mode to upload receipts.",
      );
    }
    if (file.size > MAX_RECEIPT_MB * 1024 * 1024) {
      throw new Error(`Receipt must be under ${MAX_RECEIPT_MB}MB`);
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const ownerId = user?.id ?? PUBLIC_OWNER_ID;
    if (!ownerId) {
      throw new Error(
        DEMO_MODE
          ? "Uploads are disabled in demo mode."
          : "Missing owner ID for uploads.",
      );
    }
    const safe = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
    const path = `${ownerId}/${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage
      .from("receipts")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw new Error(error.message);
    return path;
  }

  async function onSubmit(values: ExpenseInput) {
    try {
      if (editing) {
        await updateExpense(expense!.id, values);
        toast.success("Expense updated");
      } else {
        await createExpense(values);
        posthog.capture("expense_created", { category: values.category });
        toast.success("Expense logged");
        form.reset(defaultsFor(undefined, defaultPropertyId));
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save expense");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset(defaultsFor(expense, defaultPropertyId));
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit expense" : "Log expense"}</DialogTitle>
          <DialogDescription>
            Tag it to a property. Receipts welcome.
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
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={properties.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nickname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
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
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
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
            <FormField
              control={form.control}
              name="receipt_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt (optional)</FormLabel>
                  {field.value ? (
                    <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-xs">
                      <span className="truncate font-mono">
                        {field.value.split("/").slice(-1)[0]}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => field.onChange("")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <FormControl>
                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted/40">
                        <Upload className="h-4 w-4" />
                        {SINGLE_USER_MODE
                          ? "Upload unavailable in single-user mode"
                          : uploading
                            ? "Uploading…"
                            : "Upload photo or PDF"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          capture="environment"
                          className="hidden"
                          disabled={SINGLE_USER_MODE}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploading(true);
                            try {
                              const path = await uploadReceipt(file);
                              field.onChange(path);
                            } catch (err) {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "Upload failed",
                              );
                            } finally {
                              setUploading(false);
                            }
                          }}
                        />
                      </label>
                    </FormControl>
                  )}
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
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || uploading}
              >
                {editing ? "Save" : "Log expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
