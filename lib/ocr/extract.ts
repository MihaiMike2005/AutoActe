import { hasIntegration } from "@/lib/env";
import { OCR_MODEL, extractWithClaude, type OcrMime } from "./claude-vision";
import { scoreExtraction, type FieldFlag } from "./confidence";
import { demoExtraction } from "./demo-samples";
import { coerceFieldValue, documentKind, type FieldValue, type RawExtraction } from "./document-kinds";
import type { DocumentType, Profile, RegistrationScenario } from "@/types/domain";

export type OcrResult = {
  raw: RawExtraction;
  fields: Record<string, FieldValue>;
  field_flags: Record<string, FieldFlag>;
  confidence: number;
  provider: string;
};

const DEMO_LATENCY_MS = 1400;

export function normalizeFields(type: DocumentType, fields: Record<string, unknown>) {
  return Object.fromEntries(
    documentKind(type).fields.map((f) => [f.key, coerceFieldValue(f, fields[f.key])]),
  ) as Record<string, FieldValue>;
}

export async function runOcr(input: {
  type: DocumentType;
  mimeType: OcrMime;
  bytes: Uint8Array;
  scenario: RegistrationScenario;
  citizen?: Profile;
}): Promise<OcrResult> {
  let raw: RawExtraction;
  let provider: string;

  if (hasIntegration("anthropic")) {
    raw = await extractWithClaude({
      type: input.type,
      mimeType: input.mimeType,
      base64: Buffer.from(input.bytes).toString("base64"),
    });
    provider = `claude-vision:${OCR_MODEL}`;
  } else {
    await new Promise((r) => setTimeout(r, DEMO_LATENCY_MS));
    raw = demoExtraction(input.type, { scenario: input.scenario, citizen: input.citizen });
    provider = "claude-vision-demo";
  }

  const knownKeys = new Set(documentKind(input.type).fields.map((f) => f.key));
  const normalized: RawExtraction = {
    ...raw,
    fields: normalizeFields(input.type, raw.fields),
    unreadable_fields: raw.unreadable_fields.filter((k) => knownKeys.has(k)),
  };
  const { confidence, field_flags } = scoreExtraction(input.type, normalized);

  return { raw: normalized, fields: normalized.fields, field_flags, confidence, provider };
}
