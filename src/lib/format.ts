/**
 * Formatting helpers used across the app.
 * Money fields use tabular numerals (see globals.css .tabular-nums).
 */

export function formatMoney(
  amount: number | string | null | undefined,
  opts: { showCents?: boolean } = {},
): string {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.showCents === false ? 0 : 2,
    maximumFractionDigits: opts.showCents === false ? 0 : 2,
  });
}

export function formatDate(
  date: string | Date | null | undefined,
  opts: { format?: "short" | "medium" | "long" } = {},
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  const format = opts.format ?? "medium";
  return d.toLocaleDateString("en-US", {
    month: format === "short" ? "numeric" : "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatAddress(parts: {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip: string;
}): string {
  const line2 = parts.address_line2 ? `, ${parts.address_line2}` : "";
  return `${parts.address_line1}${line2}, ${parts.city}, ${parts.state} ${parts.zip}`;
}

export function daysUntil(date: string | Date): number {
  const target = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
