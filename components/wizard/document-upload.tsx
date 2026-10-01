import { ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/shared/demo-mode-badge";
import { CrossValidationPanel } from "@/components/ocr/cross-validation-panel";
import { DocumentCapture } from "@/components/ocr/document-capture";
import { advanceStepAction } from "@/lib/cases/actions";
import { documentsStepStatus } from "@/lib/cases/document-requirements";
import { hasIntegration } from "@/lib/env";
import type { DocumentRecord, Profile, RegistrationCase, Vehicle } from "@/types/domain";

export function DocumentUploadStep({
  case: c,
  vehicle,
  documents,
  citizen,
}: {
  case: RegistrationCase;
  vehicle: Vehicle;
  documents: DocumentRecord[];
  citizen?: Profile;
}) {
  const status = documentsStepStatus({ case: c, vehicle, documents, citizen });
  const requirements = [
    { done: status.vehicleReady, label: "Vehicul identificat (VIN salvat)" },
    ...status.slots
      .filter((s) => s.required)
      .map((s) => ({ done: !status.missing.includes(s), label: s.label })),
    { done: status.failing.length === 0, label: "Nicio verificare încrucișată eșuată" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Documente necesare</h3>
          <p className="text-sm text-[--color-muted-foreground]">
            Fotografiază fiecare document. Claude Vision extrage datele, iar tu doar le confirmi.
          </p>
        </div>
        {hasIntegration("anthropic") ? (
          <Badge variant="accent" className="gap-1">
            <Sparkles className="h-3 w-3" aria-hidden /> Claude Vision
          </Badge>
        ) : (
          <DemoModeBadge label="OCR demo" />
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {status.slots.map((slot) => (
          <DocumentCapture
            key={slot.key}
            caseId={c.id}
            scenario={c.scenario}
            slot={slot}
            document={documents.find((d) => d.type === slot.key)}
          />
        ))}
      </div>

      {documents.length >= 2 ? <CrossValidationPanel checks={status.checks} /> : null}

      <div className="rounded-xl border border-[--color-border] bg-[--color-secondary] p-4">
        {status.ready ? (
          <form action={advanceStepAction} className="flex flex-wrap items-center justify-between gap-3">
            <input type="hidden" name="case_id" value={c.id} />
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Dosarul de documente este complet și verificat.
            </p>
            <Button type="submit" size="lg">
              Continuă la pasul următor <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Ca să continui, mai ai nevoie de:</p>
            <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
              {requirements.map((r) => (
                <li key={r.label} className="flex items-center gap-2">
                  {r.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4 text-[--color-muted-foreground]" aria-hidden />
                  )}
                  <span className={r.done ? "text-[--color-muted-foreground] line-through" : undefined}>
                    <span className="sr-only">{r.done ? "Gata: " : "De făcut: "}</span>
                    {r.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
