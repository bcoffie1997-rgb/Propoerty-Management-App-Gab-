"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { VENDOR_CATEGORY_LABELS } from "@/lib/schemas/vendor";
import { deleteVendor } from "@/lib/actions/vendors";
import { formatDate, daysUntil } from "@/lib/format";
import type { Vendor } from "@/types/database";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageLink } from "@/components/shared/image-link";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";

export function VendorsList({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Vendor | null>(null);

  async function onDelete(id: string) {
    if (!confirm("Delete this vendor?")) return;
    try {
      await deleteVendor(id);
      toast.success("Vendor deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <VendorFormDialog
          trigger={
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Add vendor
            </Button>
          }
        />
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No vendors yet."
          description="Add your go-to contractors before something breaks."
          action={
            <VendorFormDialog
              trigger={
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add first vendor
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[7rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => {
                const expiringSoon =
                  vendor.insurance_expiration &&
                  daysUntil(vendor.insurance_expiration) <= 30;
                return (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="font-medium">{vendor.name}</div>
                      {vendor.notes && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {vendor.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {VENDOR_CATEGORY_LABELS[vendor.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{vendor.contact_name ?? "—"}</div>
                      <div className="font-mono text-xs tabular-nums">
                        {vendor.phone ?? vendor.email ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {vendor.insurance_expiration ? (
                        <div className="space-y-1">
                          <div>{formatDate(vendor.insurance_expiration)}</div>
                          {expiringSoon && <StatusBadge status="expiring" />}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vendor.active ? (
                        <StatusBadge status="active" />
                      ) : (
                        <StatusBadge status="terminated" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {vendor.image_url && (
                          <ImageLink path={vendor.image_url} />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditing(vendor)}
                          aria-label="Edit vendor"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onDelete(vendor.id)}
                          aria-label="Delete vendor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && (
        <VendorFormDialog
          vendor={editing}
          open
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
        />
      )}
    </div>
  );
}
