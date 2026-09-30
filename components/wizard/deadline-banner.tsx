"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { daysUntil } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DeadlineBanner({ deadline }: { deadline?: string | null }) {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  const tone =
    days <= 0
      ? "bg-red-600 text-white"
      : days <= 30
        ? "bg-red-50 text-red-900 border-red-200"
        : days <= 60
          ? "bg-amber-50 text-amber-900 border-amber-200"
          : "bg-emerald-50 text-emerald-900 border-emerald-200";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-sm",
        tone,
      )}
    >
      {days <= 30 ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      <div className="flex-1">
        <div className="font-semibold">
          {days <= 0
            ? "Termenul legal a fost depășit"
            : `${days} zile rămase din termenul legal de 90 zile`}
        </div>
        <div className="text-xs opacity-80">
          Conform legii, mașinile importate trebuie înmatriculate în max 90 zile de la achiziție.
        </div>
      </div>
    </div>
  );
}
