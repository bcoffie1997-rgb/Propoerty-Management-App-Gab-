import { getVendors } from "@/lib/actions/vendors";
import { VendorsList } from "@/components/vendors/vendors-list";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your contractor bench, insurance dates, and contact details.
        </p>
      </div>
      <VendorsList vendors={vendors} />
    </div>
  );
}
