"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import {
  demoCases,
  demoVehicles,
  demoDocuments,
  ORG_IDS,
} from "@/lib/mock/demo-data";
import { ScenarioSchema, VinSchema } from "@/lib/validators";
import { legalDeadlineFor, stepsFor } from "@/lib/state-machine/wizard";
import { estimateCosts } from "@/lib/calculators/costuri";
import type {
  CaseStep,
  DocumentType,
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
  if (!c) redirect("/dashboard");

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

export async function addStubDocumentAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const caseId = String(formData.get("case_id"));
  const type = String(formData.get("type")) as DocumentType;
  const c = demoCases.find((x) => x.id === caseId);
  if (!c) redirect("/dashboard");

  demoDocuments.push({
    id: "d-" + Math.random().toString(36).slice(2, 10),
    case_id: caseId,
    owner_id: session.user_id,
    type,
    file_url: "/demo/upload-placeholder.jpg",
    file_hash: "sha256:" + Math.random().toString(36).slice(2),
    mime_type: "image/jpeg",
    ocr_extracted_data: {},
    ocr_confidence: 0.82,
    ocr_provider: "claude-vision-demo",
    validated: false,
    validation_errors: [],
    uploaded_at: new Date().toISOString(),
  });

  c.updated_at = new Date().toISOString();
  void ORG_IDS;
  redirect(`/cases/${caseId}`);
}
