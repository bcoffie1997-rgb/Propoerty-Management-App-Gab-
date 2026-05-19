import { getLeasesForProperty } from "@/lib/actions/leases";
import { getTenants } from "@/lib/actions/tenants";
import type { Unit } from "@/types/database";
import { LeasesList } from "@/components/leases/leases-list";

export async function LeasesTab({
  propertyId,
  units,
}: {
  propertyId: string;
  units: Unit[];
}) {
  const [leases, tenants] = await Promise.all([
    getLeasesForProperty(propertyId),
    getTenants(),
  ]);

  return (
    <LeasesList
      leases={leases}
      units={units}
      tenants={tenants}
      defaultUnitId={units.length === 1 ? units[0].id : undefined}
    />
  );
}
