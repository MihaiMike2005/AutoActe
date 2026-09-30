import { annualImpozit } from "./impozit";
import type { RegistrationScenario } from "@/types/domain";

export type CostLine = {
  key: string;
  label: string;
  amount: number;
  note?: string;
  category: "state" | "service" | "estimate";
};

export type CostInputs = {
  scenario: RegistrationScenario;
  engineCapacityCc?: number;
  rcaEstimate?: number;
  translationCount?: number;
  imported?: boolean;
};

const STATE_FEES = {
  dgpci_registration: 60,
  plate_pair: 40,
  certificate_inmatriculare: 37,
  rar_omologare: 540,
  rar_inspection: 145,
  anaf_tva_certificate: 0,
  dgitl_fiscal: 0,
};

const DEFAULT_RCA_RON = 1450;
const TRANSLATION_RON = 200;

export function estimateCosts(inputs: CostInputs): {
  lines: CostLine[];
  total: number;
  annual: number;
} {
  const lines: CostLine[] = [];

  lines.push({
    key: "dgpci_registration",
    label: "Taxă DGPCI înmatriculare",
    amount: STATE_FEES.dgpci_registration,
    category: "state",
  });
  lines.push({
    key: "plate_pair",
    label: "Plăcuțe înmatriculare (1 set)",
    amount: STATE_FEES.plate_pair,
    category: "state",
  });
  lines.push({
    key: "certificat_inmatriculare",
    label: "Certificat înmatriculare",
    amount: STATE_FEES.certificate_inmatriculare,
    category: "state",
  });

  if (inputs.imported || inputs.scenario.startsWith("imported")) {
    lines.push({
      key: "rar_omologare",
      label: "RAR — Omologare individuală",
      amount: STATE_FEES.rar_omologare,
      category: "state",
    });
    lines.push({
      key: "rar_inspection",
      label: "RAR — Inspecție tehnică inițială",
      amount: STATE_FEES.rar_inspection,
      category: "state",
    });
    const translations = inputs.translationCount ?? 2;
    lines.push({
      key: "translations",
      label: `Traduceri legalizate (${translations} doc.)`,
      amount: translations * TRANSLATION_RON,
      category: "service",
      note: "Estimare prin marketplace",
    });
  }

  lines.push({
    key: "rca_year1",
    label: "RCA — primul an (estimare)",
    amount: inputs.rcaEstimate ?? DEFAULT_RCA_RON,
    category: "estimate",
    note: "Variază în funcție de istoricul șoferului",
  });

  const annual = annualImpozit(inputs.engineCapacityCc ?? 0);
  lines.push({
    key: "annual_impozit",
    label: "Impozit auto anual",
    amount: annual,
    category: "estimate",
    note: "Plătit anual la primărie",
  });

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return { lines, total, annual };
}
