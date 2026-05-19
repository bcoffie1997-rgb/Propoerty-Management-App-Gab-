"use client";

import { useState } from "react";
import { ExternalLink, Receipt } from "lucide-react";

import { createSignedReceiptUrl } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/button";

export function ReceiptLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const url = await createSignedReceiptUrl(path);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={open}
      disabled={loading}
      className="h-7 px-2 text-xs"
    >
      <Receipt className="mr-1 h-3 w-3" />
      Receipt
      <ExternalLink className="ml-1 h-3 w-3" />
    </Button>
  );
}
