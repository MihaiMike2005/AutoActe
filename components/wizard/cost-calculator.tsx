"use client";

import { Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { estimateCosts, type CostInputs } from "@/lib/calculators/costuri";
import { impozitBreakdown } from "@/lib/calculators/impozit";
import { formatRON } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CostCalculator(inputs: CostInputs) {
  const { lines, total, annual } = estimateCosts(inputs);
  const impozit = inputs.engineCapacityCc ? impozitBreakdown(inputs.engineCapacityCc) : null;

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
          <Receipt className="h-4 w-4" />
        </div>
        <CardTitle className="text-base">Cost estimat</CardTitle>
        <Badge variant="muted" className="ml-auto">Live</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.key} className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[--color-foreground]">{line.label}</div>
                {line.note ? (
                  <div className="text-[11px] text-[--color-muted-foreground]">{line.note}</div>
                ) : null}
              </div>
              <span className="shrink-0 font-medium tabular-nums">
                {formatRON(line.amount)}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-[--color-border] pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[--color-muted-foreground]">Total acum</span>
            <motion.span
              key={total}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-semibold text-[--color-foreground] tabular-nums"
            >
              {formatRON(total)}
            </motion.span>
          </div>
          <div className="mt-1 flex items-baseline justify-between text-xs text-[--color-muted-foreground]">
            <span>Impozit anual următor</span>
            <span className="tabular-nums">{formatRON(annual)}</span>
          </div>
        </div>

        {impozit ? (
          <div className="rounded-lg bg-[--color-secondary] p-3 text-[11px] text-[--color-muted-foreground]">
            <div className="font-medium text-[--color-foreground]">
              Detaliu impozit ({impozit.bracketLabel})
            </div>
            <div className="mt-0.5">
              {impozit.units} × {formatRON(impozit.ronPer200cc)}/200cm³ ={" "}
              <strong>{formatRON(impozit.total)}</strong>/an
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
