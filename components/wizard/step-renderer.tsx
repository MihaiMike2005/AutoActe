import { ArrowRight, Building2, Calendar, CheckCircle2, FileText, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { advanceStepAction } from "@/lib/cases/actions";
import {
  getAppointmentsForCase,
  getDocumentsForCase,
  getOrgById,
  ORG_IDS,
} from "@/lib/mock/demo-data";
import { STEP_META } from "@/lib/state-machine/wizard";
import { DocumentUploadStep } from "./document-upload";
import { VinLookup } from "./vin-lookup";
import type { RegistrationCase, Vehicle } from "@/types/domain";
import { formatDateRO, formatRON } from "@/lib/utils";

export function StepRenderer({
  case: c,
  vehicle,
}: {
  case: RegistrationCase;
  vehicle: Vehicle;
}) {
  const meta = STEP_META[c.current_step];
  const documents = getDocumentsForCase(c.id);
  const appointments = getAppointmentsForCase(c.id);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="default">Pas curent</Badge>
          {meta.institution ? <Badge variant="outline">{meta.institution}</Badge> : null}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{meta.title}</h2>
        <p className="text-[--color-muted-foreground]">{meta.subtitle}</p>
      </div>

      {c.current_step === "documents_upload" ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-base font-semibold">Identifică vehiculul</h3>
              <VinLookup caseId={c.id} vehicle={vehicle} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <DocumentUploadStep caseId={c.id} scenario={c.scenario} documents={documents} />
            </CardContent>
          </Card>
        </div>
      ) : c.current_step === "rca_insurance" ? (
        <RcaStep caseId={c.id} vehicle={vehicle} />
      ) : c.current_step === "anaf_tva_certificate" ? (
        <InstitutionStep
          caseId={c.id}
          orgId={ORG_IDS.anaf}
          title="Certificat TVA — ANAF"
          intro="Generăm cererea pre-completată din datele tale. Tu doar semnezi cu SPV."
          icon={Building2}
          ctaLabel="Marchează ca trimis & avansează"
        />
      ) : c.current_step === "rar_appointment" ? (
        <AppointmentStep caseId={c.id} appointments={appointments} orgId={ORG_IDS.rar} />
      ) : c.current_step === "rar_validation" ? (
        <InstitutionStep
          caseId={c.id}
          orgId={ORG_IDS.rar}
          title="Validare RAR"
          intro="Operatorul RAR confirmă omologarea și emite CIV. Vei primi notificare în timp real."
          icon={CheckCircle2}
          ctaLabel="Confirmă validarea & avansează"
        />
      ) : c.current_step === "dgitl_fiscal_registration" ? (
        <InstitutionStep
          caseId={c.id}
          orgId={ORG_IDS.dgitl}
          title="Înregistrare fiscală — DGITL"
          intro="Calculăm impozitul anual conform Codului Fiscal art. 470 și îl înregistrăm la primăria ta."
          icon={Receipt}
          ctaLabel="Înregistrează fiscal & avansează"
        />
      ) : c.current_step === "payment" ? (
        <PaymentStep caseId={c.id} total={c.estimated_total_cost ?? 0} />
      ) : c.current_step === "dgpci_appointment" ? (
        <AppointmentStep caseId={c.id} appointments={appointments} orgId={ORG_IDS.dgpci} />
      ) : c.current_step === "plate_issuance" ? (
        <InstitutionStep
          caseId={c.id}
          orgId={ORG_IDS.dgpci}
          title="Emiterea plăcuțelor"
          intro="Plăcuțele tale vor fi gata la ridicare în următoarele 24 ore."
          icon={FileText}
          ctaLabel="Marchează ca emise & avansează"
        />
      ) : (
        <InstitutionStep
          caseId={c.id}
          orgId={ORG_IDS.dgpci}
          title="Livrare documente"
          intro="Certificatul de înmatriculare + CIV sunt livrate prin curier — fără să mai treci pe la ghișeu."
          icon={CheckCircle2}
          ctaLabel="Finalizează dosarul"
        />
      )}
    </div>
  );
}

function InstitutionStep({
  caseId,
  orgId,
  title,
  intro,
  icon: Icon,
  ctaLabel,
}: {
  caseId: string;
  orgId: string;
  title: string;
  intro: string;
  icon: React.ElementType;
  ctaLabel: string;
}) {
  const org = getOrgById(orgId);
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-[--color-muted-foreground]">{intro}</p>
          </div>
        </div>
        {org ? (
          <div className="grid gap-2 rounded-lg border border-[--color-border] bg-[--color-secondary] p-3 text-sm">
            <div className="font-semibold">{org.name}</div>
            <div className="text-[--color-muted-foreground]">{org.address}</div>
            <div className="flex gap-3 text-xs text-[--color-muted-foreground]">
              {org.contact_phone ? <span>📞 {org.contact_phone}</span> : null}
              {org.working_hours?.weekdays ? <span>🕘 {org.working_hours.weekdays}</span> : null}
            </div>
          </div>
        ) : null}
        <Alert variant="info">
          <AlertTitle className="mb-1">Demo mode</AlertTitle>
          <AlertDescription>
            În producție, aici se inițiază apelul oficial către instituție prin n8n + API/webhook.
          </AlertDescription>
        </Alert>
        <AdvanceForm caseId={caseId} label={ctaLabel} />
      </CardContent>
    </Card>
  );
}

function RcaStep({ caseId, vehicle }: { caseId: string; vehicle: Vehicle }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="font-semibold">Selectează asigurător RCA</h3>
        <p className="text-sm text-[--color-muted-foreground]">
          Comparăm prețurile la 8 asigurători în timp real prin agregatori publici.
        </p>
        <div className="grid gap-2">
          {[
            { name: "Allianz-Țiriac", price: 1390, badge: "Recomandat" },
            { name: "Omniasig", price: 1480, badge: null },
            { name: "Groupama", price: 1510, badge: "Cel mai rapid" },
          ].map((q) => (
            <div
              key={q.name}
              className="flex items-center justify-between rounded-lg border border-[--color-border] bg-white p-3"
            >
              <div>
                <div className="font-semibold">{q.name}</div>
                <div className="text-xs text-[--color-muted-foreground]">
                  Polița 12 luni · VIN {vehicle.vin.slice(-6)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {q.badge ? <Badge variant="success">{q.badge}</Badge> : null}
                <span className="text-lg font-semibold tabular-nums">{formatRON(q.price)}</span>
              </div>
            </div>
          ))}
        </div>
        <AdvanceForm caseId={caseId} label="Activează polița & avansează" />
      </CardContent>
    </Card>
  );
}

function AppointmentStep({
  caseId,
  appointments,
  orgId,
}: {
  caseId: string;
  appointments: ReturnType<typeof getAppointmentsForCase>;
  orgId: string;
}) {
  const org = getOrgById(orgId);
  const upcoming = appointments.find((a) => a.organization_id === orgId);

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Rezervă o programare la {org?.name}</h3>
            <p className="text-sm text-[--color-muted-foreground]">
              Sincronizăm cu calendarul oficial — fără cozi, fără apeluri telefonice.
            </p>
          </div>
        </div>

        {upcoming ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <div className="font-semibold">
              Programare confirmată: {formatDateRO(upcoming.scheduled_at)},{" "}
              {new Date(upcoming.scheduled_at).toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-xs">
              Cod confirmare: <strong>{upcoming.confirmation_code}</strong> · {upcoming.location}
            </div>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            {["Joi 09:00", "Joi 11:00", "Vineri 08:30"].map((slot) => (
              <Button key={slot} variant="outline" className="justify-start gap-2">
                <Calendar className="h-4 w-4" /> {slot}
              </Button>
            ))}
          </div>
        )}

        <AdvanceForm caseId={caseId} label="Confirmă & avansează" />
      </CardContent>
    </Card>
  );
}

function PaymentStep({ caseId, total }: { caseId: string; total: number }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Plata unică — toate taxele de stat</h3>
            <p className="text-sm text-[--color-muted-foreground]">
              Card, Apple Pay, Google Pay sau ghișeu BCR/BRD. Distribuim automat către instituții.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[--color-muted-foreground]">Total de plată</span>
            <span className="text-3xl font-bold tracking-tight tabular-nums">{formatRON(total)}</span>
          </div>
          <p className="mt-2 text-xs text-[--color-muted-foreground]">
            Toate liniile sunt în coloana din dreapta — calculator live.
          </p>
        </div>
        <AdvanceForm caseId={caseId} label="Plătește cu cardul & avansează" />
      </CardContent>
    </Card>
  );
}

function AdvanceForm({ caseId, label }: { caseId: string; label: string }) {
  return (
    <form action={advanceStepAction}>
      <input type="hidden" name="case_id" value={caseId} />
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        {label}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
