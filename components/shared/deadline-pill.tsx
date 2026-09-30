import { AlarmClock, CheckCircle2 } from "lucide-react";
import { daysUntil } from "@/lib/utils";

export function DeadlinePill({ deadline }: { deadline?: string | null }) {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  if (days <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <AlarmClock className="h-3 w-3" /> Termen depășit
      </span>
    );
  }
  const tone =
    days > 60
      ? "bg-emerald-50 text-emerald-700"
      : days > 30
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {days > 60 ? <CheckCircle2 className="h-3 w-3" /> : <AlarmClock className="h-3 w-3" />}
      {days} zile rămase
    </span>
  );
}
