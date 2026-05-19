"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PropertyOption = { id: string; nickname: string };

export function PropertySelect({
  value,
  onChange,
  properties,
  placeholder = "Select a property",
  allowAll = false,
  disabled = false,
}: {
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  properties: PropertyOption[];
  placeholder?: string;
  allowAll?: boolean;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value ?? (allowAll ? "all" : "")}
      onValueChange={(v) => onChange(v === "all" ? undefined : v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value="all">All properties</SelectItem>}
        {properties.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.nickname}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
