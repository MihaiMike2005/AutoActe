import { NextResponse } from "next/server";
import { getSession, requireRole } from "@/lib/auth/session";
import { getDemoProfileById } from "@/lib/mock/demo-data";
import { DocumentTypeSchema, ScenarioSchema } from "@/lib/validators";
import { IMAGE_MIME_TYPES, OcrError, type OcrErrorCode, type OcrMime } from "@/lib/ocr/claude-vision";
import { tierFor } from "@/lib/ocr/confidence";
import { runOcr } from "@/lib/ocr/extract";
import { savePendingUpload } from "@/lib/ocr/upload-store";

export const maxDuration = 60;

// The proxy buffers at most 10 MB of request body, so stay safely below it.
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED: readonly string[] = [...IMAGE_MIME_TYPES, "application/pdf"];

const ERROR_STATUS: Record<OcrErrorCode, number> = {
  refused: 422,
  rejected_input: 422,
  invalid_output: 422,
  rate_limited: 429,
  auth: 502,
  upstream: 502,
};

function meta() {
  return { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() };
}

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ data: null, error: { code, message }, meta: meta() }, { status });
}

async function sha256Hex(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !requireRole(session, "citizen")) {
    return fail(401, "unauthorized", "Autentifică-te pentru a încărca documente.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "invalid_request", "Fișierul nu a putut fi citit. Dacă depășește 8 MB, încearcă unul mai mic.");
  }

  const file = form.get("file");
  const type = DocumentTypeSchema.safeParse(form.get("document_type"));
  const scenario = ScenarioSchema.safeParse(form.get("scenario"));
  const caseId = String(form.get("case_id") ?? "");
  if (!(file instanceof File) || !type.success || !scenario.success || !caseId) {
    return fail(400, "invalid_request", "Lipsește fișierul sau tipul documentului.");
  }
  if (file.size > MAX_BYTES) {
    return fail(413, "file_too_large", "Fișierul depășește 8 MB. Încearcă o fotografie sau un PDF mai mic.");
  }
  if (!ACCEPTED.includes(file.type)) {
    return fail(415, "unsupported_type", "Acceptăm fotografii JPG, PNG, WebP sau fișiere PDF.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = file.type as OcrMime;

  try {
    const result = await runOcr({
      type: type.data,
      mimeType,
      bytes,
      scenario: scenario.data,
      citizen: getDemoProfileById(session.user_id),
    });

    const uploadId = `up_${crypto.randomUUID()}`;
    const fileHash = `sha256:${await sha256Hex(bytes)}`;
    savePendingUpload({
      id: uploadId,
      owner_id: session.user_id,
      case_id: caseId,
      type: type.data,
      mime_type: mimeType,
      bytes,
      file_hash: fileHash,
      provider: result.provider,
      raw: result.raw,
      fields: result.fields,
      confidence: result.confidence,
      created_at: Date.now(),
    });

    return NextResponse.json({
      data: {
        upload_id: uploadId,
        document_type: type.data,
        fields: result.fields,
        field_flags: result.field_flags,
        confidence: result.confidence,
        tier: tierFor(result.confidence),
        image_quality: result.raw.image_quality,
        document_matches_type: result.raw.document_matches_type,
        detected_document: result.raw.detected_document,
        provider: result.provider,
        file_hash: fileHash,
      },
      error: null,
      meta: meta(),
    });
  } catch (err) {
    if (err instanceof OcrError) return fail(ERROR_STATUS[err.code], err.code, err.message);
    console.error("OCR failed", err);
    return fail(500, "internal_error", "A apărut o eroare neașteptată. Reîncearcă.");
  }
}
