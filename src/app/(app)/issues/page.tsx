import { getProperties } from "@/lib/actions/properties";
import { getTenants } from "@/lib/actions/tenants";
import { getVendors } from "@/lib/actions/vendors";
import { getIssues } from "@/lib/actions/issues";
import { IssuesList } from "@/components/issues/issues-list";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const [issues, properties, tenants, vendors] = await Promise.all([
    getIssues(),
    getProperties(),
    getTenants(),
    getVendors(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track maintenance tickets from report through close-out.
        </p>
      </div>
      <IssuesList
        issues={issues}
        properties={properties}
        tenants={tenants}
        vendors={vendors}
      />
    </div>
  );
}
