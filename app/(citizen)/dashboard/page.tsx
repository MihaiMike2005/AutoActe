import Link from "next/link";
import { ArrowRight, ArrowUpRight, Car, FilePlus2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CaseStatusBadge, StepBadge } from "@/components/shared/case-status-badge";
import { DeadlinePill } from "@/components/shared/deadline-pill";
import { DemoModeBadge } from "@/components/shared/demo-mode-badge";
import { IntegrationStrip } from "@/components/shared/integration-strip";
import {
  getCasesForCitizen,
  getNotificationsForUser,
  getVehicleById,
} from "@/lib/mock/demo-data";
import { progressPct } from "@/lib/state-machine/wizard";
import { requireRoleOrRedirect } from "@/components/shared/role-required";
import { formatRON, formatDateRO } from "@/lib/utils";

export const metadata = { title: "Dashboard — AutoActe" };

export default async function CitizenDashboard() {
  const session = await requireRoleOrRedirect("citizen");
  const cases = getCasesForCitizen(session.user_id);
  const notifications = getNotificationsForUser(session.user_id).slice(0, 4);

  const active = cases.filter((c) => c.status !== "completed");
  const totalSpend = cases.reduce((sum, c) => sum + c.total_paid, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Bună, {session.full_name.split(" ")[0]} 👋
            </h1>
            <DemoModeBadge label="Date demo Cluj" />
          </div>
          <p className="text-[--color-muted-foreground]">
            Ai <strong>{active.length}</strong> dosar{active.length === 1 ? "" : "e"} active.{" "}
            Total cheltuit până acum:{" "}
            <strong>{formatRON(totalSpend)}</strong>.
          </p>
          <IntegrationStrip />
        </div>
        <Button asChild size="lg" className="shadow-md shadow-[--color-primary]/20">
          <Link href="/cases/new">
            <Plus className="h-4 w-4" /> Dosar nou
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Dosare active" value={`${active.length}`} icon={Car} accent="primary" />
        <StatCard label="Total cheltuit" value={formatRON(totalSpend)} icon={FilePlus2} accent="success" />
        <StatCard
          label="Următoarea programare"
          value="Joi 09:00"
          subtitle="RAR Cluj — pista 2"
          icon={Sparkles}
          accent="accent"
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Dosare</h2>
            <p className="text-sm text-[--color-muted-foreground]">
              Continuă acolo unde ai rămas — totul se sincronizează în timp real.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/documents">
              Vezi toate documentele <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {cases.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-lg font-semibold">Nu ai încă niciun dosar.</h3>
              <p className="mt-1 text-[--color-muted-foreground]">
                Începe cu un VIN și îți auto-completăm 80% din date.
              </p>
              <Button asChild className="mt-6">
                <Link href="/cases/new">Începe acum</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((c) => {
              const vehicle = getVehicleById(c.vehicle_id)!;
              const pct = progressPct(c.scenario, c.current_step);
              return (
                <Card key={c.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {vehicle.make} {vehicle.model}
                        <Badge variant="outline">{vehicle.year}</Badge>
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        {c.case_number}
                        <span className="text-[--color-muted-foreground]/40">·</span>
                        VIN {vehicle.vin.slice(-6)}
                      </CardDescription>
                    </div>
                    <CaseStatusBadge status={c.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[--color-muted-foreground]">
                      <StepBadge step={c.current_step} />
                      <DeadlinePill deadline={c.legal_deadline} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-[--color-muted-foreground]">
                        <span>Progres</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                    <div className="flex items-center justify-between border-t border-[--color-border] pt-3 text-sm">
                      <div>
                        <div className="text-[--color-muted-foreground] text-xs">Cost estimat</div>
                        <div className="font-semibold">{formatRON(c.estimated_total_cost ?? 0)}</div>
                      </div>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/cases/${c.id}`}>
                          Deschide <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Notificări recente</h2>
        <Card>
          <CardContent className="divide-y divide-[--color-border] p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[--color-muted-foreground]">
                Nimic nou. Totul e bifat.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.action_url ?? "#"}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-[--color-secondary]"
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? "bg-slate-300" : "bg-[--color-primary]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{n.title}</div>
                      <span className="text-xs text-[--color-muted-foreground]">
                        {formatDateRO(n.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-[--color-muted-foreground]">{n.message}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  accent: "primary" | "success" | "accent";
}) {
  const tones = {
    primary: "bg-[--color-primary]/10 text-[--color-primary]",
    success: "bg-emerald-100 text-emerald-700",
    accent: "bg-violet-100 text-violet-700",
  } as const;
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-[--color-muted-foreground]">{subtitle}</div> : null}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${tones[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
