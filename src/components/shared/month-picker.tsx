"use client";

import { addMonths, format, parse } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Month identifier format: "YYYY-MM" (matches database period_month convention,
 * less the trailing -01).
 */
export function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (yyyymm: string) => void;
}) {
  const current = parse(`${value}-01`, "yyyy-MM-dd", new Date());

  function shift(delta: number) {
    const next = addMonths(current, delta);
    onChange(format(next, "yyyy-MM"));
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-md border bg-background p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => shift(-1)}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[8rem] text-center text-sm font-medium tabular-nums">
        {format(current, "MMMM yyyy")}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => shift(1)}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
