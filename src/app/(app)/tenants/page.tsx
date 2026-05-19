import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { getTenants } from "@/lib/actions/tenants";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoneyCell } from "@/components/shared/money-cell";
import { EmptyState } from "@/components/shared/empty-state";
import { TenantFormDialog } from "@/components/tenants/tenant-form-dialog";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tenants.length === 0
              ? "Suspiciously quiet."
              : `${tenants.length} ${tenants.length === 1 ? "tenant" : "tenants"}.`}
          </p>
        </div>
        <TenantFormDialog
          trigger={
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Add tenant
            </Button>
          }
        />
      </div>

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants."
          description="Suspiciously quiet. Add one when you sign a lease."
          action={
            <TenantFormDialog
              trigger={
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add tenant
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
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead>Lease ends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link href={`/tenants/${t.id}`} className="hover:underline">
                      {t.first_name} {t.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {t.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.current_lease
                      ? `${t.current_lease.unit.property.nickname}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.current_lease ? (
                      <MoneyCell
                        amount={t.current_lease.monthly_rent}
                        showCents={false}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {t.current_lease
                      ? formatDate(t.current_lease.end_date)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
