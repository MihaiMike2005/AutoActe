import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CaseStatusBadge } from "@/components/shared/case-status-badge";
import { DeadlinePill } from "@/components/shared/deadline-pill";
import { WizardStepper } from "@/components/wizard/wizard-stepper";
import { CostCalculator } from "@/components/wizard/cost-calculator";
import { DeadlineBanner } from "@/components/wizard/deadline-banner";
import { StepRenderer } from "@/components/wizard/step-renderer";
import { AiAssistant } from "@/components/wizard/ai-assistant";
import { getCaseById, getVehicleById } from "@/lib/mock/demo-data";
import { progressPct, stepsFor } from "@/lib/state-machine/wizard";
import { requireRoleOrRedirect } from "@/components/shared/role-required";
import { Progress } from "@/components/ui/progress";

export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const session = await requireRoleOrRedirect("citizen");
  const { caseId } = await params;
  const c = getCaseById(caseId);
  if (!c || c.citizen_id !== session.user_id) notFound();

  const vehicle = getVehicleById(c.vehicle_id)!;
  const seq = stepsFor(c.scenario);
  const pct = progressPct(c.scenario, c.current_step);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-[--color-muted-foreground]">
            <Button asChild variant="ghost" size="sm" className="-ml-2 h-7 px-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <span>·</span>
            <span>{c.case_number}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {vehicle.make} {vehicle.model} <span className="text-[--color-muted-foreground]">·</span>{" "}
              <span className="font-mono text-base font-medium text-[--color-muted-foreground]">{vehicle.vin}</span>
            </h1>
            <CaseStatusBadge status={c.status} />
            <DeadlinePill deadline={c.legal_deadline} />
          </div>
        </div>
      </div>

      {c.scenario.startsWith("imported") ? <DeadlineBanner deadline={c.legal_deadline} /> : null}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
        <aside className="space-y-3 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:sticky lg:top-20">
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between text-xs text-[--color-muted-foreground]">
                <span>Progres total</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <WizardStepper steps={c.steps} currentStep={c.current_step} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <Car className="h-4 w-4 text-[--color-muted-foreground]" /> Vehicul
              </div>
              <dl className="space-y-1 text-[--color-muted-foreground]">
                <div className="flex justify-between gap-2">
                  <dt>VIN</dt>
                  <dd className="font-mono text-[10px]">{vehicle.vin}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>An</dt>
                  <dd>{vehicle.year}</dd>
                </div>
                {vehicle.engine_capacity_cc ? (
                  <div className="flex justify-between gap-2">
                    <dt>Cilindree</dt>
                    <dd>{vehicle.engine_capacity_cc} cm³</dd>
                  </div>
                ) : null}
                {vehicle.fuel_type ? (
                  <div className="flex justify-between gap-2">
                    <dt>Combustibil</dt>
                    <dd>{vehicle.fuel_type}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-2">
                  <dt>Scenariu</dt>
                  <dd>
                    <Badge variant="muted" size="sm">{c.scenario}</Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Pași totali</dt>
                  <dd>{seq.length}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0">
          <StepRenderer case={c} vehicle={vehicle} />
        </section>

        <aside className="space-y-3 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
          <CostCalculator
            scenario={c.scenario}
            engineCapacityCc={vehicle.engine_capacity_cc}
            imported={c.scenario.startsWith("imported")}
          />
        </aside>
      </div>

      <AiAssistant />
    </div>
  );
}
