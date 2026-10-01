"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession, requireRole } from "@/lib/auth/session";
import {
  demoCases,
  demoVehicles,
  demoDocuments,
  getDemoProfileById,
  getDocumentsForCase,
} from "@/lib/mock/demo-data";
import { documentsStepStatus } from "@/lib/cases/document-requirements";
import { canAdvanceCase } from "@/lib/cases/permissions";
import { ScenarioSchema, VinSchema } from "@/lib/validators";
import { legalDeadlineFor, stepsFor } from "@/lib/state-machine/wizard";
import { estimateCosts } from "@/lib/calculators/costuri";
import { publishEvent } from "@/lib/events/publish";
import { AUTOFILL_LABELS, applyAutofill } from "@/lib/ocr/autofill";
import { formatProblem } from "@/lib/ocr/confidence";
import { documentKind, type FieldValue } from "@/lib/ocr/document-kinds";
import { normalizeFields } from "@/lib/ocr/extract";
import { deleteStoredFile, storeFile, takePendingUpload } from "@/lib/ocr/upload-store";
import type {
  CaseStep,
  DocumentRecord,
  RegistrationCase,
  Vehicle,
} from "@/types/domain";

const CASE_COUNTER = { value: 200 };

function nextCaseNumber() {
  CASE_COUNTER.value += 1;
  return `INM-${new Date().getFullYear()}-${String(CASE_COUNTER.value).padStart(6, "0")}`;
}

function makeDraftSteps(caseId: string, scenario: RegistrationCase["scenario"]): CaseStep[] {
  return stepsFor(scenario).map((code, i) => ({
    id: `${caseId}-step-${i}`,
    case_id: caseId,
    step_code: code,
    status: i === 0 ? "in_progress" : "pending",
    display_order: i,
    started_at: i === 0 ? new Date().toISOString() : undefined,
  }));
}

export async function createDraftCaseAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const scenario = ScenarioSchema.parse(formData.get("scenario"));

  const vehicleId = "v-" + Math.random().toString(36).slice(2, 8);
  const vehicle: Vehicle = {
    id: vehicleId,
    vin: "UNKNOWN" + Math.random().toString(36).slice(2, 7).toUpperCase(),
    make: "—",
    model: "—",
    year: new Date().getFullYear(),
    current_owner_id: session.user_id,
  };
  demoVehicles.push(vehicle);

  const caseId = "c-" + Math.random().toString(36).slice(2, 10);
  const deadline = legalDeadlineFor(scenario);
  const costs = estimateCosts({ scenario, imported: scenario.startsWith("imported") });

  const newCase: RegistrationCase = {
    id: caseId,
    case_number: nextCaseNumber(),
    citizen_id: session.user_id,
    vehicle_id: vehicleId,
    scenario,
    status: "draft",
    current_step: "documents_upload",
    estimated_total_cost: costs.total,
    total_paid: 0,
    legal_deadline: deadline?.toISOString().slice(0, 10),
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: makeDraftSteps(caseId, scenario),
  };
  demoCases.push(newCase);

  redirect(`/cases/${caseId}`);
}

export async function setVehicleProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const caseId = String(formData.get("case_id"));
  const c = demoCases.find((x) => x.id === caseId && x.citizen_id === session.user_id);
  if (!c) redirect("/dashboard");

  const v = demoVehicles.find((x) => x.id === c.vehicle_id);
  if (!v) redirect(`/cases/${caseId}`);

  const ParseSchema = z.object({
    vin: VinSchema,
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
    fuel_type: z.string().optional(),
    engine_capacity_cc: z.coerce.number().int().nonnegative().optional(),
    power_kw: z.coerce.number().int().nonnegative().optional(),
    euro_standard: z.string().optional(),
  });

  const parsed = ParseSchema.parse({
    vin: formData.get("vin"),
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    fuel_type: formData.get("fuel_type"),
    engine_capacity_cc: formData.get("engine_capacity_cc"),
    power_kw: formData.get("power_kw"),
    euro_standard: formData.get("euro_standard"),
  });

  Object.assign(v, parsed);

  const costs = estimateCosts({
    scenario: c.scenario,
    engineCapacityCc: parsed.engine_capacity_cc,
    imported: c.scenario.startsWith("imported"),
  });
  c.estimated_total_cost = costs.total;
  c.updated_at = new Date().toISOString();

  redirect(`/cases/${caseId}`);
}

export async function advanceStepAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const caseId = String(formData.get("case_id"));
  const c = demoCases.find((x) => x.id === caseId);
  if (!c || !canAdvanceCase(session, c)) redirect("/dashboard");

  if (c.current_step === "documents_upload") {
    const vehicle = demoVehicles.find((v) => v.id === c.vehicle_id);
    const status = vehicle
      ? documentsStepStatus({
          case: c,
          vehicle,
          documents: getDocumentsForCase(c.id),
          citizen: getDemoProfileById(c.citizen_id),
        })
      : null;
    if (!status?.ready) redirect(`/cases/${caseId}`);
  }

  const seq = stepsFor(c.scenario);
  const idx = seq.indexOf(c.current_step);
  const currentStep = c.steps.find((s) => s.step_code === c.current_step);
  if (currentStep) {
    currentStep.status = "completed";
    currentStep.completed_at = new Date().toISOString();
  }
  if (idx >= 0 && idx < seq.length - 1) {
    c.current_step = seq[idx + 1];
    const next = c.steps.find((s) => s.step_code === c.current_step);
    if (next) {
      next.status = "in_progress";
      next.started_at = new Date().toISOString();
    }
    c.status = "in_progress";
  } else {
    c.status = "completed";
    c.completed_at = new Date().toISOString();
  }
  c.updated_at = new Date().toISOString();

  redirect(`/cases/${caseId}`);
}

export type ConfirmDocumentResult =
  | { ok: true; document_id: string; autofilled: string[] }
  | { ok: false; error: string };

export async function confirmDocumentAction(input: {
  case_id: string;
  upload_id: string;
  fields: Record<string, FieldValue>;
}): Promise<ConfirmDocumentResult> {
  const session = await getSession();
  if (!session || !requireRole(session, "citizen")) {
    return { ok: false, error: "Sesiunea a expirat. Autentifică-te din nou." };
  }
  const c = demoCases.find((x) => x.id === input.case_id && x.citizen_id === session.user_id);
  if (!c) return { ok: false, error: "Dosarul nu a fost găsit." };

  const upload = takePendingUpload(input.upload_id, session.user_id);
  if (!upload || upload.case_id !== c.id) {
    return { ok: false, error: "Scanarea a expirat. Fotografiază documentul din nou." };
  }

  const kind = documentKind(upload.type);
  const fields = normalizeFields(upload.type, input.fields ?? {});
  const corrected = kind.fields.some((f) => fields[f.key] !== upload.fields[f.key]);
  const validationErrors = kind.fields.flatMap((f) => {
    const problem = formatProblem(f, fields[f.key]);
    return problem ? [{ field: f.key, message: problem }] : [];
  });

  for (let i = demoDocuments.length - 1; i >= 0; i--) {
    const d = demoDocuments[i];
    if (d.case_id === c.id && d.type === upload.type) {
      demoDocuments.splice(i, 1);
      deleteStoredFile(d.id);
    }
  }

  const now = new Date().toISOString();
  const documentId = `d-${crypto.randomUUID().slice(0, 8)}`;
  storeFile(documentId, { mime_type: upload.mime_type, bytes: upload.bytes, owner_id: session.user_id });
  const doc: DocumentRecord = {
    id: documentId,
    case_id: c.id,
    vehicle_id: c.vehicle_id,
    owner_id: session.user_id,
    type: upload.type,
    file_url: `/api/internal/documents/${documentId}/file`,
    file_hash: upload.file_hash,
    file_size_bytes: upload.bytes.byteLength,
    mime_type: upload.mime_type,
    ocr_extracted_data: fields,
    ocr_confidence: upload.confidence,
    ocr_provider: upload.provider,
    validated: false,
    validation_errors: validationErrors,
    uploaded_at: now,
  };
  demoDocuments.push(doc);

  publishEvent("ro.autoacte.document.uploaded", {
    document_id: documentId,
    case_id: c.id,
    type: upload.type,
    owner_id: session.user_id,
  });
  publishEvent("ro.autoacte.document.ocr_completed", {
    document_id: documentId,
    confidence: upload.confidence,
    extracted_data: fields,
    corrected_by_citizen: corrected,
  });

  const vehicle = demoVehicles.find((v) => v.id === c.vehicle_id);
  const autofilled = vehicle ? applyAutofill(upload.type, fields, vehicle, c) : [];
  if (vehicle && autofilled.length) {
    c.metadata.autofill = { fields: autofilled, source: upload.type, at: now };
    c.estimated_total_cost = estimateCosts({
      scenario: c.scenario,
      engineCapacityCc: vehicle.engine_capacity_cc,
      imported: c.scenario.startsWith("imported"),
    }).total;
  }
  c.updated_at = now;

  refresh();
  return { ok: true, document_id: documentId, autofilled: autofilled.map((k) => AUTOFILL_LABELS[k] ?? k) };
}

export async function removeDocumentAction(documentId: string): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session || !requireRole(session, "citizen")) return { ok: false };

  const idx = demoDocuments.findIndex((d) => d.id === documentId && d.owner_id === session.user_id);
  if (idx < 0) return { ok: false };
  demoDocuments.splice(idx, 1);
  deleteStoredFile(documentId);

  refresh();
  return { ok: true };
}
