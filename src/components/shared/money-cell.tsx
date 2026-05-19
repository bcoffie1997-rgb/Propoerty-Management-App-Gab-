import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

export function MoneyCell({
  amount,
  showCents = true,
  emphasis = "default",
  className,
}: {
  amount: number | string | null | undefined;
  showCents?: boolean;
  emphasis?: "default" | "positive" | "negative" | "muted";
  className?: string;
}) {
  const formatted = formatMoney(amount, { showCents });
  const n =
    typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  const tone =
    emphasis === "positive"
      ? "text-emerald-700 dark:text-emerald-400"
      : emphasis === "negative"
        ? "text-red-700 dark:text-red-400"
        : emphasis === "muted"
          ? "text-muted-foreground"
          : n < 0
            ? "text-red-700 dark:text-red-400"
            : "";

  return (
    <span
      className={cn("font-mono tabular-nums tracking-tight", tone, className)}
    >
      {formatted}
    </span>
  );
}
