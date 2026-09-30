import { Badge } from "@/components/ui/badge";
import type { CaseStatus, StepCode } from "@/types/domain";

const STATUS_LABEL: Record<CaseStatus, { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" | "accent" }> = {
  draft: { label: "Schiță", variant: "muted" },
  in_progress: { label: "În progres", variant: "default" },
  awaiting_institution: { label: "Așteaptă instituție", variant: "warning" },
  awaiting_citizen: { label: "Așteaptă cetățean", variant: "accent" },
  completed: { label: "Finalizat", variant: "success" },
  rejected: { label: "Respins", variant: "danger" },
  cancelled: { label: "Anulat", variant: "muted" },
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const meta = STATUS_LABEL[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

const STEP_LABEL: Record<StepCode, string> = {
  documents_upload: "Documente",
  rca_insurance: "RCA",
  anaf_tva_certificate: "ANAF TVA",
  rar_appointment: "Programare RAR",
  rar_validation: "Validare RAR",
  dgitl_fiscal_registration: "DGITL fiscal",
  dgpci_appointment: "Programare DGPCI",
  payment: "Plată",
  plate_issuance: "Plăcuțe",
  document_delivery: "Livrare acte",
};

export function StepBadge({ step }: { step: StepCode }) {
  return <Badge variant="outline">{STEP_LABEL[step]}</Badge>;
}
