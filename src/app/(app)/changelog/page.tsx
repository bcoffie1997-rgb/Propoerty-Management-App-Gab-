import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Santi Fortune",
};

export default function ChangelogPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What&apos;s new and what&apos;s changed.
        </p>
      </div>

      <div className="space-y-10">
        {/* Unreleased */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Unreleased</h2>
          <p className="text-sm text-muted-foreground">
            Changes currently in development.
          </p>
        </section>

        {/* v0.2.0 */}
        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-lg font-semibold">v0.2.0</h2>
            <span className="text-xs text-muted-foreground">May 19, 2026</span>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                Added
              </h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">
                    Photo upload for vendors and issues
                  </span>{" "}
                  — take a picture via mobile camera or upload an image file
                  from desktop. Photos are stored in Supabase Storage and
                  viewable from the vendors/issues list tables.
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    image_url
                  </code>{" "}
                  columns added to the vendors and maintenance_issues database
                  tables.
                </li>
                <li>
                  Shared storage helper for client-side image uploads and
                  signed URL generation.
                </li>
                <li>
                  Server actions now clean up stored images when a vendor or
                  issue is deleted or its photo is replaced.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                Changed
              </h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">
                    Default theme is now dark mode
                  </span>{" "}
                  instead of following the system preference.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                Fixed
              </h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>
                  Pinned{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    date-fns
                  </code>{" "}
                  to{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    ^3.6.0
                  </code>{" "}
                  to resolve a peer dependency conflict with{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    react-day-picker@8.10.2
                  </code>{" "}
                  that was breaking Vercel builds.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* v0.1.0 */}
        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-lg font-semibold">v0.1.0</h2>
            <span className="text-xs text-muted-foreground">May 19, 2026</span>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                Added
              </h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">
                    Initial MVP release
                  </span>{" "}
                  — Santi Fortune property manager.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Property management
                  </span>{" "}
                  — add, edit, and track properties with addresses, purchase
                  info, and notes.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Tenant management
                  </span>{" "}
                  — store tenant contact info and emergency contacts.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Lease management
                  </span>{" "}
                  — create leases linked to units and tenants, track rent
                  amounts, deposits, and status.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Rent payments
                  </span>{" "}
                  — log and track monthly rent payments with status (paid,
                  partial, late, unpaid).
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Vendor directory
                  </span>{" "}
                  — manage preferred contractors by category with insurance
                  expiration alerts.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Maintenance issues
                  </span>{" "}
                  — create, assign, and track maintenance tickets from report
                  to completion with priority, status, due dates, and cost
                  tracking.
                </li>
                <li>
                  <span className="font-medium text-foreground">Expenses</span>{" "}
                  — log property expenses with receipt upload (PDF/image) to
                  Supabase Storage.
                </li>
                <li>
                  Dashboard overview showing key portfolio metrics.
                </li>
                <li>
                  Responsive UI with mobile-optimized navigation and quick-add
                  FAB.
                </li>
                <li>
                  Supabase-backed auth, database, and storage with RLS
                  policies.
                </li>
                <li>Demo mode support for offline/local testing.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
