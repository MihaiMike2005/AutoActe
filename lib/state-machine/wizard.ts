import type { RegistrationScenario, StepCode } from "@/types/domain";

export const STEPS_BY_SCENARIO: Record<RegistrationScenario, StepCode[]> = {
  new_ro: [
    "documents_upload",
    "rca_insurance",
    "dgitl_fiscal_registration",
    "payment",
    "dgpci_appointment",
    "plate_issuance",
    "document_delivery",
  ],
  used_ro: [
    "documents_upload",
    "rca_insurance",
    "dgitl_fiscal_registration",
    "payment",
    "dgpci_appointment",
    "plate_issuance",
    "document_delivery",
  ],
  imported_eu: [
    "documents_upload",
    "anaf_tva_certificate",
    "rar_appointment",
    "rar_validation",
    "rca_insurance",
    "dgitl_fiscal_registration",
    "payment",
    "dgpci_appointment",
    "plate_issuance",
    "document_delivery",
  ],
  imported_non_eu: [
    "documents_upload",
    "anaf_tva_certificate",
    "rar_appointment",
    "rar_validation",
    "rca_insurance",
    "dgitl_fiscal_registration",
    "payment",
    "dgpci_appointment",
    "plate_issuance",
    "document_delivery",
  ],
};

export const STEP_META: Record<
  StepCode,
  { title: string; subtitle: string; institution?: string; estMinutes: number }
> = {
  documents_upload: {
    title: "Încărcare documente",
    subtitle: "Carte de identitate, brief, contract, factură.",
    estMinutes: 10,
  },
  anaf_tva_certificate: {
    title: "Certificat TVA — ANAF",
    subtitle: "Necesar pentru vehiculele aduse din UE.",
    institution: "ANAF",
    estMinutes: 1440,
  },
  rar_appointment: {
    title: "Programare RAR",
    subtitle: "Inspecție tehnică inițială + omologare.",
    institution: "RAR",
    estMinutes: 60,
  },
  rar_validation: {
    title: "Validare RAR",
    subtitle: "Confirmarea omologării și emiterea CIV.",
    institution: "RAR",
    estMinutes: 120,
  },
  rca_insurance: {
    title: "Asigurare RCA",
    subtitle: "Polița obligatorie de răspundere civilă.",
    institution: "Asigurător",
    estMinutes: 15,
  },
  dgitl_fiscal_registration: {
    title: "Înregistrare fiscală — DGITL",
    subtitle: "La primăria locală, pentru impozitul auto.",
    institution: "DGITL",
    estMinutes: 30,
  },
  payment: {
    title: "Plată taxe înmatriculare",
    subtitle: "Toate taxele de stat consolidate într-o singură plată.",
    estMinutes: 5,
  },
  dgpci_appointment: {
    title: "Programare DGPCI",
    subtitle: "Direcția Regim Permise — emiterea actelor.",
    institution: "DGPCI",
    estMinutes: 60,
  },
  plate_issuance: {
    title: "Emiterea plăcuțelor",
    subtitle: "Predare set plăcuțe + sigiliu.",
    institution: "DGPCI",
    estMinutes: 30,
  },
  document_delivery: {
    title: "Livrare documente",
    subtitle: "Certificat înmatriculare + CIV livrate prin curier.",
    estMinutes: 0,
  },
};

export function stepsFor(scenario: RegistrationScenario): StepCode[] {
  return STEPS_BY_SCENARIO[scenario];
}

export function nextStep(
  scenario: RegistrationScenario,
  current: StepCode,
): StepCode | null {
  const seq = stepsFor(scenario);
  const i = seq.indexOf(current);
  return i === -1 || i === seq.length - 1 ? null : seq[i + 1];
}

export function previousStep(
  scenario: RegistrationScenario,
  current: StepCode,
): StepCode | null {
  const seq = stepsFor(scenario);
  const i = seq.indexOf(current);
  return i <= 0 ? null : seq[i - 1];
}

export function progressPct(
  scenario: RegistrationScenario,
  current: StepCode,
): number {
  const seq = stepsFor(scenario);
  const i = seq.indexOf(current);
  if (i < 0) return 0;
  return Math.round(((i + 1) / seq.length) * 100);
}

export function legalDeadlineFor(
  scenario: RegistrationScenario,
  importedAt?: Date,
): Date | null {
  if (!scenario.startsWith("imported")) return null;
  const base = importedAt ?? new Date();
  const d = new Date(base);
  d.setDate(d.getDate() + 90);
  return d;
}
