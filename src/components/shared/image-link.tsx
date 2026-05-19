"use client";

import { useState } from "react";
import { ExternalLink, Camera } from "lucide-react";

import { createSignedImageUrl } from "@/lib/actions/images";
import { Button } from "@/components/ui/button";

export function ImageLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const url = await createSignedImageUrl(path);
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
      <Camera className="mr-1 h-3 w-3" />
      Photo
      <ExternalLink className="ml-1 h-3 w-3" />
    </Button>
  );
}
