import { isValidCnp, isValidVin } from "@/lib/validators";
import { documentKind, type FieldDef, type FieldValue, type RawExtraction } from "./document-kinds";
import type { DocumentType } from "@/types/domain";

export type ConfidenceTier = "high" | "medium" | "low";
export type FieldFlag = "ok" | "check" | "missing";

const QUALITY_BASE: Record<RawExtraction["image_quality"], number> = {
  good: 0.97,
  fair: 0.86,
  poor: 0.62,
};

export function tierFor(confidence: number): ConfidenceTier {
  if (confidence >= 0.9) return "high";
  if (confidence >= 0.7) return "medium";
  return "low";
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function formatProblem(field: FieldDef, value: FieldValue): string | null {
  if (value === null || typeof value !== "string") return null;
  if (field.kind === "vin" && !isValidVin(value)) return "VIN-ul nu are formatul corect (17 caractere, fără I, O, Q)";
  if (field.kind === "cnp" && !isValidCnp(value)) return "CNP-ul nu trece verificarea cifrei de control";
  if (field.kind === "date" && !isIsoDate(value)) return "Data nu are formatul AAAA-LL-ZZ";
  return null;
}

export function flagFields(type: DocumentType, raw: RawExtraction): Record<string, FieldFlag> {
  const unreadable = new Set(raw.unreadable_fields);
  return Object.fromEntries(
    documentKind(type).fields.map((f) => {
      const value = raw.fields[f.key] ?? null;
      if (unreadable.has(f.key) || formatProblem(f, value)) return [f.key, "check"];
      if (value === null) return [f.key, "missing"];
      return [f.key, "ok"];
    }),
  );
}

export function scoreExtraction(type: DocumentType, raw: RawExtraction) {
  const flags = flagFields(type, raw);
  const keyFields = documentKind(type).fields.filter((f) => f.key_field);
  const okKeys = keyFields.filter((f) => flags[f.key] === "ok").length;
  const checkKeys = keyFields.filter((f) => flags[f.key] === "check").length;
  const coverage = keyFields.length ? okKeys / keyFields.length : 1;

  let confidence = QUALITY_BASE[raw.image_quality] * (0.55 + 0.45 * coverage) - 0.08 * checkKeys;
  if (!raw.document_matches_type) confidence = Math.min(confidence, 0.35);
  confidence = Math.min(0.99, Math.max(0.05, confidence));

  return { confidence: Math.round(confidence * 100) / 100, field_flags: flags };
}
