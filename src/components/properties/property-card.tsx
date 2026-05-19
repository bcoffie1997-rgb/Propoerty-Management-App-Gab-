import Link from "next/link";
import { Home, MapPin } from "lucide-react";

import type { Property } from "@/types/database";
import { formatAddress } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <Card className="h-full border-border/70 bg-card/70 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight tracking-tight">
              {property.nickname}
            </h3>
            <Home className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="font-mono leading-snug">
              {formatAddress(property)}
            </span>
          </div>
          <div className="pt-2 text-xs">
            <span className="inline-flex rounded-full border border-border/70 bg-muted/40 px-2 py-1 capitalize text-muted-foreground">
              {property.property_type.replace("_", " ")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
