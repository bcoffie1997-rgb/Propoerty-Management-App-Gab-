import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Pencil } from "lucide-react";

import { getTenantById } from "@/lib/actions/tenants";
import { formatAddress, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoneyCell } from "@/components/shared/money-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RentHistoryTable } from "@/components/rent/rent-history-table";
import { TenantFormDialog } from "@/components/tenants/tenant-form-dialog";

export const dynamic = "force-dynamic";

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getTenantById(params.id);
  if (!data) notFound();
  const { tenant, leases, rent_history } = data;
  const currentLease = leases.find((l) => l.status === "active") ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {tenant.first_name} {tenant.last_name}
          </h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {tenant.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {tenant.email}
              </span>
            )}
            {tenant.phone && (
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Phone className="h-3.5 w-3.5" />
                {tenant.phone}
              </span>
            )}
          </div>
        </div>
        <TenantFormDialog
          tenant={tenant}
          trigger={
            <Button variant="outline" size="sm">
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          }
        />
      </div>

      {tenant.emergency_contact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {tenant.emergency_contact}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current lease</CardTitle>
        </CardHeader>
        <CardContent>
          {currentLease ? (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Field label="Property">
                <Link
                  href={`/properties/${currentLease.unit.property.id}`}
                  className="font-medium hover:underline"
                >
                  {currentLease.unit.property.nickname}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {formatAddress(currentLease.unit.property)}
                </div>
              </Field>
              <Field label="Unit">{currentLease.unit.unit_label}</Field>
              <Field label="Rent">
                <MoneyCell amount={currentLease.monthly_rent} />
              </Field>
              <Field label="Deposit">
                <MoneyCell amount={currentLease.deposit_amount} />
              </Field>
              <Field label="Start">{formatDate(currentLease.start_date)}</Field>
              <Field label="End">{formatDate(currentLease.end_date)}</Field>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active lease.</p>
          )}
        </CardContent>
      </Card>

      {leases.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lease history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">
                      {l.unit.property.nickname}
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      {formatDate(l.start_date)} → {formatDate(l.end_date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyCell amount={l.monthly_rent} showCents={false} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rent payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rent_history.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No rent history yet." />
            </div>
          ) : (
            <RentHistoryTable payments={rent_history} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
