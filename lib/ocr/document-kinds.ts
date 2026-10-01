import { z } from "zod";
import type { DocumentType } from "@/types/domain";

export type FieldKind = "text" | "date" | "number" | "vin" | "cnp" | "boolean";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  key_field?: boolean;
};

export type DocumentKind = {
  type: DocumentType;
  title: string;
  description: string;
  fields: FieldDef[];
};

const SALE_FIELDS: FieldDef[] = [
  { key: "seller_name", label: "Vânzător", kind: "text", key_field: true, hint: "Seller (Verkäufer / Vânzător): person or company name as printed" },
  { key: "seller_address", label: "Adresă vânzător", kind: "text" },
  { key: "buyer_name", label: "Cumpărător", kind: "text", key_field: true, hint: "Buyer (Käufer / Cumpărător): person or company name as printed" },
  { key: "buyer_address", label: "Adresă cumpărător", kind: "text" },
  { key: "vin", label: "VIN", kind: "vin", key_field: true, hint: "Vehicle identification number (Fahrgestellnummer / serie șasiu)" },
  { key: "make", label: "Marcă", kind: "text" },
  { key: "model", label: "Model", kind: "text" },
  { key: "price", label: "Preț", kind: "number", key_field: true, hint: "Total sale price as a plain number" },
  { key: "currency", label: "Monedă", kind: "text", hint: "ISO 4217 code, e.g. EUR or RON" },
  { key: "contract_date", label: "Data contractului", kind: "date", key_field: true },
  { key: "mileage_km", label: "Kilometraj", kind: "number", hint: "Odometer reading in km (Kilometerstand)" },
  { key: "invoice_number", label: "Nr. document", kind: "text", hint: "Invoice or contract number, if printed" },
];

const GENERIC_FIELDS: FieldDef[] = [
  { key: "document_title", label: "Tip document", kind: "text", key_field: true },
  { key: "issuer", label: "Emitent", kind: "text", key_field: true },
  { key: "holder_name", label: "Titular", kind: "text" },
  { key: "issue_date", label: "Data emiterii", kind: "date", key_field: true },
  { key: "reference_number", label: "Nr. document", kind: "text" },
  { key: "vin", label: "VIN", kind: "vin" },
];

const KINDS: Record<DocumentType, DocumentKind> = {
  id_card: {
    type: "id_card",
    title: "Carte de identitate",
    description:
      "a Romanian identity card (Carte de identitate). The machine-readable zone at the bottom repeats the surname, given names, series, number and dates.",
    fields: [
      { key: "last_name", label: "Nume", kind: "text", key_field: true },
      { key: "first_name", label: "Prenume", kind: "text", key_field: true },
      { key: "cnp", label: "CNP", kind: "cnp", key_field: true, hint: "13-digit personal numeric code" },
      { key: "birth_date", label: "Data nașterii", kind: "date" },
      { key: "address", label: "Domiciliu", kind: "text", key_field: true, hint: "Full address from the Domiciliu field" },
      { key: "series", label: "Serie", kind: "text", hint: "Two-letter series, e.g. CJ" },
      { key: "number", label: "Număr", kind: "text", hint: "Six-digit number after the series" },
      { key: "issuing_authority", label: "Emis de", kind: "text" },
      { key: "issue_date", label: "Valabil de la", kind: "date" },
      { key: "expiry_date", label: "Valabil până la", kind: "date", key_field: true },
    ],
  },
  brief_foreign: {
    type: "brief_foreign",
    title: "Brief / certificat de înmatriculare străin",
    description:
      "a vehicle registration certificate from another EU country, most often a German Zulassungsbescheinigung Teil I or Teil II (Fahrzeugbrief). Harmonised EU field codes appear next to each value.",
    fields: [
      { key: "vin", label: "VIN", kind: "vin", key_field: true, hint: "Field E" },
      { key: "make", label: "Marcă", kind: "text", key_field: true, hint: "Field D.1" },
      { key: "model", label: "Model", kind: "text", key_field: true, hint: "Commercial name, field D.3" },
      { key: "first_registration_date", label: "Prima înmatriculare", kind: "date", key_field: true, hint: "Field B" },
      { key: "owner_name", label: "Proprietar înscris", kind: "text", key_field: true, hint: "Holder, fields C.1.1 and C.1.2 (Teil I) or C.2 (Teil II)" },
      { key: "owner_address", label: "Adresă proprietar", kind: "text", hint: "Field C.1.3 or C.2 address" },
      { key: "engine_capacity_cc", label: "Cilindree (cm³)", kind: "number", hint: "Field P.1" },
      { key: "power_kw", label: "Putere (kW)", kind: "number", hint: "Field P.2" },
      { key: "mass_kg", label: "Masă (kg)", kind: "number", hint: "Field G, mass in running order" },
      { key: "fuel_type", label: "Combustibil", kind: "text", hint: "Field P.3" },
      { key: "co2_emissions_g_km", label: "CO₂ (g/km)", kind: "number", hint: "Field V.7" },
      { key: "euro_standard", label: "Normă poluare", kind: "text", hint: "Field V.9 or the emission class code" },
      { key: "color", label: "Culoare", kind: "text", hint: "Field R" },
      { key: "issuing_country", label: "Țară emitentă", kind: "text", hint: "ISO 3166-1 alpha-2 code of the issuing country" },
      { key: "document_number", label: "Nr. document", kind: "text" },
    ],
  },
  kaufvertrag: {
    type: "kaufvertrag",
    title: "Contract de vânzare-cumpărare",
    description:
      "a used-vehicle sale contract, often a German Kaufvertrag (ADAC or similar template), but it may be in another EU language.",
    fields: SALE_FIELDS,
  },
  ownership_contract: {
    type: "ownership_contract",
    title: "Factură / contract de achiziție",
    description:
      "a Romanian vehicle purchase invoice (factură) from a dealer or a vehicle sale contract (contract de vânzare-cumpărare) between two parties.",
    fields: SALE_FIELDS,
  },
  coc: {
    type: "coc",
    title: "Certificat de conformitate (COC)",
    description: "an EU Certificate of Conformity (COC) issued by the vehicle manufacturer.",
    fields: [
      { key: "vin", label: "VIN", kind: "vin", key_field: true },
      { key: "make", label: "Marcă", kind: "text", key_field: true },
      { key: "model", label: "Model", kind: "text", key_field: true, hint: "Commercial name" },
      { key: "vehicle_category", label: "Categorie", kind: "text", key_field: true, hint: "EU vehicle category, e.g. M1" },
      { key: "type_approval_number", label: "Nr. omologare UE", kind: "text", key_field: true },
      { key: "engine_capacity_cc", label: "Cilindree (cm³)", kind: "number" },
      { key: "power_kw", label: "Putere (kW)", kind: "number" },
      { key: "mass_kg", label: "Masă (kg)", kind: "number", hint: "Mass in running order" },
      { key: "fuel_type", label: "Combustibil", kind: "text" },
      { key: "co2_emissions_g_km", label: "CO₂ (g/km)", kind: "number", hint: "Combined WLTP value if several are printed" },
      { key: "euro_standard", label: "Normă poluare", kind: "text" },
    ],
  },
  civ: {
    type: "civ",
    title: "Cartea de identitate a vehiculului (CIV)",
    description:
      "a Romanian vehicle identity book (Cartea de Identitate a Vehiculului, CIV) issued by RAR.",
    fields: [
      { key: "civ_series", label: "Serie CIV", kind: "text", key_field: true, hint: "Letter followed by six digits, printed on the cover or first page" },
      { key: "vin", label: "VIN", kind: "vin", key_field: true },
      { key: "make", label: "Marcă", kind: "text", key_field: true },
      { key: "model", label: "Model", kind: "text" },
      { key: "vehicle_category", label: "Categorie", kind: "text" },
      { key: "manufacture_year", label: "An fabricație", kind: "number", key_field: true },
      { key: "engine_capacity_cc", label: "Cilindree (cm³)", kind: "number" },
      { key: "power_kw", label: "Putere (kW)", kind: "number" },
      { key: "mass_kg", label: "Masă (kg)", kind: "number" },
      { key: "fuel_type", label: "Combustibil", kind: "text" },
      { key: "color", label: "Culoare", kind: "text" },
      { key: "euro_standard", label: "Normă poluare", kind: "text" },
      { key: "owner_name", label: "Ultimul proprietar", kind: "text", hint: "Most recent owner listed, if an owners page is visible" },
    ],
  },
  rca_policy: {
    type: "rca_policy",
    title: "Poliță RCA",
    description: "a Romanian mandatory motor liability insurance policy (poliță RCA).",
    fields: [
      { key: "policy_number", label: "Nr. poliță", kind: "text", key_field: true },
      { key: "insurer", label: "Asigurător", kind: "text", key_field: true },
      { key: "insured_name", label: "Asigurat", kind: "text", key_field: true },
      { key: "vin", label: "VIN", kind: "vin" },
      { key: "license_plate", label: "Nr. înmatriculare", kind: "text" },
      { key: "valid_from", label: "Valabil de la", kind: "date", key_field: true },
      { key: "valid_to", label: "Valabil până la", kind: "date", key_field: true },
    ],
  },
  itp_certificate: {
    type: "itp_certificate",
    title: "Certificat ITP",
    description: "a Romanian periodic technical inspection certificate (ITP).",
    fields: [
      { key: "vin", label: "VIN", kind: "vin", key_field: true },
      { key: "license_plate", label: "Nr. înmatriculare", kind: "text" },
      { key: "inspection_date", label: "Data inspecției", kind: "date", key_field: true },
      { key: "valid_until", label: "Valabil până la", kind: "date", key_field: true },
      { key: "inspection_station", label: "Stație ITP", kind: "text" },
      { key: "mileage_km", label: "Kilometraj", kind: "number" },
    ],
  },
  fiscal_certificate: {
    type: "fiscal_certificate",
    title: "Certificat fiscal",
    description:
      "a Romanian local tax certificate (certificat de atestare fiscală) issued by a city hall tax office (DGITL / DITL) for a vehicle sale.",
    fields: [
      { key: "holder_name", label: "Titular", kind: "text", key_field: true },
      { key: "holder_id", label: "CNP / CUI", kind: "text" },
      { key: "issuer", label: "Emis de", kind: "text", key_field: true },
      { key: "issue_date", label: "Data emiterii", kind: "date", key_field: true },
      { key: "certificate_number", label: "Nr. certificat", kind: "text" },
      { key: "no_outstanding_debts", label: "Fără datorii", kind: "boolean", key_field: true, hint: "true when the certificate states there are no outstanding local tax debts" },
      { key: "vin", label: "VIN", kind: "vin" },
    ],
  },
  tva_certificate: {
    type: "tva_certificate",
    title: "Certificat TVA",
    description: "a Romanian ANAF certificate confirming VAT status for an imported vehicle.",
    fields: GENERIC_FIELDS,
  },
  translation: {
    type: "translation",
    title: "Traducere legalizată",
    description: "a certified Romanian translation of a foreign vehicle document.",
    fields: GENERIC_FIELDS,
  },
  other: {
    type: "other",
    title: "Document",
    description: "a document related to a vehicle registration.",
    fields: GENERIC_FIELDS,
  },
};

export function documentKind(type: DocumentType): DocumentKind {
  return KINDS[type];
}

function zodForField(field: FieldDef) {
  const base =
    field.kind === "number" ? z.number() : field.kind === "boolean" ? z.boolean() : z.string();
  const description = [field.label, field.hint].filter(Boolean).join(". ");
  return base.nullable().describe(description);
}

export function extractionSchemaFor(type: DocumentType) {
  const kind = documentKind(type);
  const shape = Object.fromEntries(kind.fields.map((f) => [f.key, zodForField(f)]));
  return z.object({
    fields: z.object(shape),
    image_quality: z.string().describe("One of: good, fair, poor"),
    document_matches_type: z.boolean(),
    detected_document: z.string().nullable(),
    unreadable_fields: z.array(z.string()),
  });
}

export type FieldValue = string | number | boolean | null;

export type RawExtraction = {
  fields: Record<string, FieldValue>;
  image_quality: "good" | "fair" | "poor";
  document_matches_type: boolean;
  detected_document: string | null;
  unreadable_fields: string[];
};

export function coerceFieldValue(field: FieldDef, value: unknown): FieldValue {
  if (value === null || value === undefined) return null;
  if (field.kind === "number") {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const cleaned = String(value).replace(/\s/g, "").replace(",", ".");
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  if (field.kind === "boolean") {
    if (typeof value === "boolean") return value;
    const s = String(value).trim().toLowerCase();
    if (["true", "da", "yes", "1"].includes(s)) return true;
    if (["false", "nu", "no", "0"].includes(s)) return false;
    return null;
  }
  const s = String(value).trim();
  if (s === "") return null;
  if (field.kind === "vin") return s.replace(/\s/g, "").toUpperCase();
  if (field.kind === "cnp") return s.replace(/\s/g, "");
  return s;
}
