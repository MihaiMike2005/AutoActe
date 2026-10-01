import { crossValidate } from "@/lib/ocr/cross-validate";
import type { DocumentRecord, DocumentType, Profile, RegistrationCase, RegistrationScenario, Vehicle } from "@/types/domain";

export type DocSlot = {
  key: DocumentType;
  label: string;
  hint: string;
  required: boolean;
};

export const DOCUMENT_SLOTS: Record<RegistrationScenario, DocSlot[]> = {
  new_ro: [
    { key: "id_card", label: "Carte de identitate", hint: "Față, cu CNP-ul clar vizibil", required: true },
    { key: "ownership_contract", label: "Factură achiziție", hint: "De la dealerul autorizat", required: true },
    { key: "civ", label: "CIV", hint: "Cartea de identitate a vehiculului", required: true },
    { key: "coc", label: "COC (omologare)", hint: "Certificatul de conformitate UE", required: false },
  ],
  used_ro: [
    { key: "id_card", label: "Carte de identitate", hint: "Față, cu CNP-ul clar vizibil", required: true },
    { key: "civ", label: "CIV", hint: "De la fostul proprietar", required: true },
    { key: "ownership_contract", label: "Contract vânzare", hint: "Semnat de ambele părți", required: true },
    { key: "fiscal_certificate", label: "Certificat fiscal", hint: "Eliberat de DGITL fostului proprietar", required: true },
  ],
  imported_eu: [
    { key: "id_card", label: "Carte de identitate", hint: "Față, cu CNP-ul clar vizibil", required: true },
    { key: "brief_foreign", label: "Brief / Fahrzeugbrief", hint: "Certificatul de înmatriculare din UE", required: true },
    { key: "kaufvertrag", label: "Kaufvertrag / Contract", hint: "Contractul de vânzare-cumpărare", required: true },
    { key: "coc", label: "COC", hint: "Certificate of Conformity", required: true },
    { key: "translation", label: "Traduceri legalizate", hint: "Pentru Brief și Kaufvertrag", required: false },
  ],
  imported_non_eu: [
    { key: "id_card", label: "Carte de identitate", hint: "Față, cu CNP-ul clar vizibil", required: true },
    { key: "brief_foreign", label: "Documente origine", hint: "Title sau echivalent", required: true },
    { key: "kaufvertrag", label: "Bill of sale", hint: "Contractul de vânzare", required: true },
    { key: "translation", label: "Traduceri + apostilă", hint: "Pentru toate documentele", required: true },
  ],
};

export function isVehicleIdentified(vehicle: Vehicle) {
  return Boolean(vehicle.vin && !vehicle.vin.startsWith("UNKNOWN") && vehicle.make && vehicle.make !== "—");
}

export function documentsStepStatus(input: {
  case: RegistrationCase;
  vehicle: Vehicle;
  documents: DocumentRecord[];
  citizen?: Profile;
}) {
  const slots = DOCUMENT_SLOTS[input.case.scenario];
  const missing = slots.filter((s) => s.required && !input.documents.some((d) => d.type === s.key));
  const checks = crossValidate({ documents: input.documents, vehicle: input.vehicle, citizen: input.citizen });
  const failing = checks.filter((c) => c.status === "fail");
  const vehicleReady = isVehicleIdentified(input.vehicle);
  return {
    slots,
    missing,
    checks,
    failing,
    vehicleReady,
    ready: missing.length === 0 && failing.length === 0 && vehicleReady,
  };
}
