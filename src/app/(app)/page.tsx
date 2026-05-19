import { getDashboardData } from "@/lib/actions/dashboard";
import { formatMoney } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { ActionCards } from "@/components/dashboard/action-cards";
import { RentStatusTable } from "@/components/dashboard/rent-status-table";
import { LeaseExpirationsCard } from "@/components/dashboard/lease-expirations-card";
import { RecentExpensesCard } from "@/components/dashboard/recent-expenses-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const {
    summary,
    rentStatus,
    expiringLeases,
    recentExpenses,
    overdueIssues,
    expiringVendors,
  } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <ActionCards
        rentStatus={rentStatus}
        expiringLeases={expiringLeases}
        overdueIssues={overdueIssues}
        expiringVendors={expiringVendors}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Units"
          value={summary.totalUnits}
          hint={`${summary.occupiedUnits} occupied`}
        />
        <StatCard
          label="Occupancy"
          value={
            summary.totalUnits > 0
              ? `${Math.round((summary.occupiedUnits / summary.totalUnits) * 100)}%`
              : "—"
          }
        />
        <StatCard
          label="Rent collected"
          value={formatMoney(summary.rentCollected, { showCents: false })}
          hint={
            summary.rentDue > 0
              ? `of ${formatMoney(summary.rentDue, { showCents: false })} due`
              : undefined
          }
          emphasis={
            summary.rentCollected >= summary.rentDue && summary.rentDue > 0
              ? "positive"
              : "default"
          }
        />
        <StatCard
          label="Net this month"
          value={formatMoney(summary.net, { showCents: false })}
          emphasis={summary.net >= 0 ? "positive" : "negative"}
        />
      </div>

      <div id="rent-status">
        <RentStatusTable rows={rentStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LeaseExpirationsCard leases={expiringLeases} />
        <RecentExpensesCard expenses={recentExpenses} />
      </div>
    </div>
  );
}
