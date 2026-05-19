import { Home, Plus } from "lucide-react";

import { getProperties } from "@/lib/actions/properties";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFormDialog } from "@/components/properties/property-form-dialog";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {properties.length === 0
              ? "Nothing here yet."
              : `${properties.length} ${properties.length === 1 ? "property" : "properties"}.`}
          </p>
        </div>
        <PropertyFormDialog
          trigger={
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Add property
            </Button>
          }
        />
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties yet."
          description="Hard to manage what doesn't exist."
          action={
            <PropertyFormDialog
              trigger={
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add your first property
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
