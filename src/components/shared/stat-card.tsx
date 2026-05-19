import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  emphasis = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  emphasis?: "default" | "positive" | "negative";
  className?: string;
}) {
  const tone =
    emphasis === "positive"
      ? "text-emerald-700 dark:text-emerald-400"
      : emphasis === "negative"
        ? "text-red-700 dark:text-red-400"
        : "";
  return (
    <Card
      className={cn(
        "border-border/70 bg-card/70 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            "mt-1.5 font-mono text-3xl font-semibold leading-none tabular-nums",
            tone,
          )}
        >
          {value}
        </div>
        {hint && (
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}
