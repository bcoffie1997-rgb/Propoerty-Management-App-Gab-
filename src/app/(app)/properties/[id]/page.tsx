import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { getPropertyById } from "@/lib/actions/properties";
import { formatAddress, formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoneyCell } from "@/components/shared/money-cell";
import { PropertyFormDialog } from "@/components/properties/property-form-dialog";
import { DeletePropertyButton } from "@/components/properties/delete-property-button";
import { LeasesTab } from "@/components/leases/leases-tab";
import { FinancialsTab } from "@/components/dashboard/financials-tab";
import { ExpensesTab } from "@/components/expenses/expenses-tab";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getPropertyById(params.id);
  if (!result) notFound();
  const { property, units } = result;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {property.nickname}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {formatAddress(property)}
          </p>
        </div>
        <div className="flex gap-2">
          <PropertyFormDialog
            property={property}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            }
          />
          <DeletePropertyButton
            propertyId={property.id}
            nickname={property.nickname}
          />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Reference info for taxes, insurance, and your own memory.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <DetailRow
                label="Type"
                value={property.property_type.replace("_", " ")}
                capitalize
              />
              <DetailRow
                label="Units"
                value={`${units.length} ${units.length === 1 ? "unit" : "units"}`}
              />
              <DetailRow
                label="Purchase date"
                value={formatDate(property.purchase_date)}
              />
              <DetailRow
                label="Purchase price"
                value={
                  <MoneyCell amount={property.purchase_price} showCents={false} />
                }
              />
              <DetailRow
                label="Current value"
                value={
                  <MoneyCell amount={property.current_value} showCents={false} />
                }
              />
              {property.purchase_price && property.current_value && (
                <DetailRow
                  label="Appreciation"
                  value={
                    <span className="font-mono tabular-nums">
                      {formatMoney(
                        property.current_value - property.purchase_price,
                        { showCents: false },
                      )}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>
          {property.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{property.notes}</p>
              </CardContent>
            </Card>
          )}
          {units.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Units</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {units.map((u, i) => (
                  <div key={u.id}>
                    {i > 0 && <Separator className="my-2" />}
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium">{u.unit_label}</div>
                      <div className="font-mono text-xs text-muted-foreground tabular-nums">
                        {[u.bedrooms && `${u.bedrooms} bd`, u.bathrooms && `${u.bathrooms} ba`, u.sqft && `${u.sqft} sqft`]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leases">
          <LeasesTab propertyId={property.id} units={units} />
        </TabsContent>

        <TabsContent value="financials">
          <FinancialsTab propertyId={property.id} />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab propertyId={property.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: React.ReactNode;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          capitalize ? "text-sm capitalize" : "text-sm"
        }
      >
        {value}
      </dd>
    </div>
  );
}
