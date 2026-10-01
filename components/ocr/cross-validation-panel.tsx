"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CrossCheck } from "@/lib/ocr/cross-validate";

const STYLES = {
  pass: { icon: CheckCircle2, row: "border-emerald-200 bg-emerald-50/60", iconClass: "text-emerald-600", sr: "Trecut" },
  warn: { icon: AlertTriangle, row: "border-amber-200 bg-amber-50/60", iconClass: "text-amber-600", sr: "Atenție" },
  fail: { icon: XCircle, row: "border-red-200 bg-red-50/70", iconClass: "text-red-600", sr: "Eșuat" },
} as const;

export function CrossValidationPanel({ checks }: { checks: CrossCheck[] }) {
  if (!checks.length) return null;
  const failing = checks.filter((c) => c.status === "fail").length;
  const passing = checks.filter((c) => c.status === "pass").length;

  return (
    <section aria-labelledby="cross-validation-title" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="cross-validation-title" className="flex items-center gap-2 text-base font-semibold">
          <ShieldCheck className="h-4 w-4 text-[--color-primary]" aria-hidden />
          Verificare încrucișată
        </h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            failing ? "bg-red-500/15 text-red-700" : "bg-emerald-500/15 text-emerald-700",
          )}
        >
          {failing === 1
            ? "1 problemă de rezolvat"
            : failing
              ? `${failing} probleme de rezolvat`
              : `${passing} din ${checks.length} verificări trecute`}
        </span>
      </div>
      <ul className="space-y-2">
        {checks.map((check, i) => {
          const style = STYLES[check.status];
          const Icon = style.icon;
          return (
            <motion.li
              key={check.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className={cn("flex items-start gap-3 rounded-lg border p-3 text-sm", style.row)}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconClass)} aria-hidden />
              <div className="min-w-0">
                <div className="font-medium">
                  <span className="sr-only">{style.sr}: </span>
                  {check.title}
                </div>
                <p className="break-words text-xs text-[--color-muted-foreground]">{check.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
