"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Home, User, Wrench, Briefcase } from "lucide-react";

import { searchAll, type SearchResults } from "@/lib/actions/search";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categoryIcons = {
  Property: Home,
  Tenant: User,
  Issue: Wrench,
  Vendor: Briefcase,
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const allResults = [
    ...(results?.properties ?? []),
    ...(results?.tenants ?? []),
    ...(results?.issues ?? []),
    ...(results?.vendors ?? []),
  ];

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchAll(q);
      setResults(data);
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(query), 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, performSearch]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const result = allResults[selectedIndex];
      if (result) {
        setOpen(false);
        router.push(result.href);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function navigateTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search properties, tenants, issues, vendors…"
                className="pl-9 pr-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setQuery("");
                    setResults(null);
                    inputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Press{" "}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>{" "}
              to navigate,{" "}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to select
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto px-2 pb-2">
            {loading && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Searching…
              </div>
            )}

            {!loading && query.trim() && allResults.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}

            {!loading &&
              results &&
              (
                [
                  ["Property", results.properties] as const,
                  ["Tenant", results.tenants] as const,
                  ["Issue", results.issues] as const,
                  ["Vendor", results.vendors] as const,
                ] as const
              ).map(
                ([category, items]) =>
                  items.length > 0 && (
                    <div key={category} className="py-1">
                      <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {category}s
                      </div>
                      {items.map((item, idx) => {
                        const globalIdx =
                          allResults.findIndex((r) => r.id === item.id);
                        const Icon =
                          categoryIcons[category as keyof typeof categoryIcons];
                        return (
                          <button
                            key={item.id}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                              globalIdx === selectedIndex
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-muted",
                            )}
                            onClick={() => navigateTo(item.href)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">
                                {item.label}
                              </div>
                              {item.sublabel && (
                                <div className="truncate text-xs text-muted-foreground">
                                  {item.sublabel}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ),
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
