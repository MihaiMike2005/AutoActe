"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemoModeBadge({ label = "Demo Mode" }: { label?: string }) {
  return (
    <Badge variant="accent" className="gap-1">
      <Sparkles className="h-3 w-3" />
      {label}
    </Badge>
  );
}
