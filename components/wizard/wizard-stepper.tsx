"use client";

import { Check, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStep, StepCode } from "@/types/domain";
import { STEP_META } from "@/lib/state-machine/wizard";

export function WizardStepper({
  steps,
  currentStep,
}: {
  steps: CaseStep[];
  currentStep: StepCode;
}) {
  return (
    <ol className="space-y-1">
      {steps.map((step, i) => {
        const meta = STEP_META[step.step_code];
        const active = step.step_code === currentStep;
        const done = step.status === "completed";
        return (
          <li key={step.id}>
            <div
              className={cn(
                "relative flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                active && "bg-[--color-primary]/10",
              )}
            >
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold border-2 transition-colors",
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : active
                        ? "border-[--color-primary] bg-white text-[--color-primary]"
                        : "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                </span>
                {i < steps.length - 1 ? (
                  <span
                    className={cn(
                      "mt-1 h-6 w-px",
                      done ? "bg-emerald-300" : "bg-slate-200",
                    )}
                  />
                ) : null}
              </div>
              <div className="min-w-0 pt-0.5">
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium",
                    active ? "text-[--color-foreground]" : "text-[--color-foreground]/80",
                  )}
                >
                  {meta.title}
                  {step.status === "blocked" ? (
                    <Lock className="h-3 w-3 text-amber-600" />
                  ) : null}
                </div>
                <div className="text-xs text-[--color-muted-foreground]">
                  {meta.institution ?? (active ? "În progres" : "")}
                </div>
              </div>
              {active ? (
                <Circle
                  className="absolute right-3 top-3 h-2 w-2 fill-[--color-primary] text-[--color-primary]"
                  aria-hidden
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
