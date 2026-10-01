"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  ScanText,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfidenceBadge } from "@/components/ocr/confidence-badge";
import { confirmDocumentAction, removeDocumentAction } from "@/lib/cases/actions";
import type { DocSlot } from "@/lib/cases/document-requirements";
import { prepareForUpload } from "@/lib/ocr/client-image";
import { tierFor, type ConfidenceTier, type FieldFlag } from "@/lib/ocr/confidence";
import { documentKind, type FieldDef, type FieldValue } from "@/lib/ocr/document-kinds";
import { cn } from "@/lib/utils";
import type { DocumentRecord, DocumentType, RegistrationScenario } from "@/types/domain";

type OcrData = {
  upload_id: string;
  document_type: DocumentType;
  fields: Record<string, FieldValue>;
  field_flags: Record<string, FieldFlag>;
  confidence: number;
  tier: ConfidenceTier;
  image_quality: "good" | "fair" | "poor";
  document_matches_type: boolean;
  detected_document: string | null;
  provider: string;
};

type Phase = "idle" | "replacing" | "scanning" | "review" | "error";
type Preview = { url: string | null; name: string };

const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function toInputValue(value: FieldValue | undefined) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toneFor(confidence: number | undefined) {
  if (confidence === undefined) return "border-[--color-border]";
  const tier = tierFor(confidence);
  if (tier === "high") return "border-emerald-200 bg-emerald-50/40";
  if (tier === "medium") return "border-amber-200 bg-amber-50/40";
  return "border-red-200 bg-red-50/40";
}

export function DocumentCapture({
  caseId,
  scenario,
  slot,
  document,
}: {
  caseId: string;
  scenario: RegistrationScenario;
  slot: DocSlot;
  document?: DocumentRecord;
}) {
  const kind = documentKind(slot.key);
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<OcrData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  function reset() {
    setPhase("idle");
    setPreview(null);
    setResult(null);
    setValues({});
    setError(null);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const prepared = await prepareForUpload(file);
    if (prepared.size > MAX_UPLOAD_BYTES) {
      setError("Fișierul depășește 8 MB. Încearcă o fotografie sau un PDF mai mic.");
      setPhase("error");
      return;
    }
    setPreview({
      url: prepared.type.startsWith("image/") ? URL.createObjectURL(prepared) : null,
      name: file.name,
    });
    setPhase("scanning");

    const body = new FormData();
    body.append("file", prepared);
    body.append("document_type", slot.key);
    body.append("case_id", caseId);
    body.append("scenario", scenario);

    try {
      const res = await fetch("/api/internal/ocr", { method: "POST", body });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error?.message ?? "Documentul nu a putut fi citit. Reîncearcă.");
        setPhase("error");
        return;
      }
      const data = json.data as OcrData;
      setResult(data);
      setValues(Object.fromEntries(kind.fields.map((f) => [f.key, toInputValue(data.fields[f.key])])));
      setPhase("review");
    } catch {
      setError("Eroare de rețea. Verifică conexiunea și reîncearcă.");
      setPhase("error");
    }
  }

  function confirm() {
    if (!result) return;
    const fields = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v.trim() === "" ? null : v]),
    );
    startSaving(async () => {
      const res = await confirmDocumentAction({ case_id: caseId, upload_id: result.upload_id, fields });
      if (!res.ok) {
        toast.error(res.error);
        if (res.error.includes("expirat")) reset();
        return;
      }
      toast.success(`${slot.label}: date confirmate`, {
        description: res.autofilled.length
          ? `Completat automat în profilul vehiculului: ${res.autofilled.join(", ")}.`
          : "Documentul a fost atașat dosarului.",
      });
      reset();
    });
  }

  function remove() {
    if (!document) return;
    startSaving(async () => {
      const res = await removeDocumentAction(document.id);
      if (res.ok) toast(`${slot.label} a fost eliminat din dosar.`);
    });
  }

  const inputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );

  const showSaved = document && phase === "idle";
  const confidence = phase === "review" && result ? result.confidence : showSaved ? document.ocr_confidence : undefined;

  return (
    <div className={cn("rounded-xl border p-4 transition-colors", toneFor(confidence))}>
      {inputs}
      <SlotHeader slot={slot} saved={Boolean(document)} confidence={showSaved ? document.ocr_confidence : undefined} />

      {showSaved ? (
        <motion.div key="saved" {...fade}>
          <SavedDocument document={document} fields={kind.fields} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPhase("replacing")} disabled={saving}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Înlocuiește
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={saving} aria-label={`Elimină ${slot.label}`}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Trash2 className="h-3.5 w-3.5" aria-hidden />}
            </Button>
          </div>
        </motion.div>
      ) : phase === "idle" || phase === "replacing" ? (
        <motion.div key="pick" {...fade} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={() => cameraRef.current?.click()}>
            <Camera className="h-4 w-4" aria-hidden /> Fotografiază
          </Button>
          <Button type="button" variant="secondary" className="min-h-11 flex-1" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden /> Încarcă fișier
          </Button>
          {phase === "replacing" ? (
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => setPhase("idle")}>
              Anulează
            </Button>
          ) : null}
        </motion.div>
      ) : phase === "scanning" ? (
        <motion.div key="scan" {...fade} className="mt-3">
          <ScanningPreview preview={preview} />
        </motion.div>
      ) : phase === "error" ? (
        <motion.div key="error" {...fade} className="mt-3 space-y-2">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => cameraRef.current?.click()}>
              <Camera className="h-3.5 w-3.5" aria-hidden /> Refă fotografia
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Anulează
            </Button>
          </div>
        </motion.div>
      ) : result ? (
        <motion.div key="review" {...fade} className="mt-3">
          <ReviewPanel
            result={result}
            preview={preview}
            fields={kind.fields}
            kindTitle={kind.title}
            values={values}
            onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
            onConfirm={confirm}
            onRetake={() => cameraRef.current?.click()}
            onCancel={reset}
            saving={saving}
          />
        </motion.div>
      ) : null}
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.18 },
};

function SlotHeader({ slot, saved, confidence }: { slot: DocSlot; saved: boolean; confidence?: number }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
            saved ? "bg-emerald-500/15 text-emerald-700" : "bg-[--color-primary]/10 text-[--color-primary]",
          )}
        >
          {saved ? <FileCheck2 className="h-5 w-5" aria-hidden /> : <FileText className="h-5 w-5" aria-hidden />}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 font-semibold">
            {slot.label}
            {slot.required ? <Badge variant="muted" size="sm">Obligatoriu</Badge> : <Badge variant="outline" size="sm">Opțional</Badge>}
          </div>
          <p className="text-xs text-[--color-muted-foreground]">{slot.hint}</p>
        </div>
      </div>
      {confidence !== undefined ? <ConfidenceBadge confidence={confidence} /> : null}
    </div>
  );
}

function SavedDocument({ document, fields }: { document: DocumentRecord; fields: FieldDef[] }) {
  const data = document.ocr_extracted_data ?? {};
  const shown = fields.filter((f) => f.key_field && data[f.key] !== null && data[f.key] !== undefined).slice(0, 4);
  const hasImage = document.file_url.startsWith("/api/internal/documents/") && document.mime_type?.startsWith("image/");

  return (
    <div className="mt-3 flex gap-3">
      {hasImage ? (
        <Image
          src={document.file_url}
          alt=""
          width={80}
          height={56}
          unoptimized
          className="h-14 w-20 shrink-0 rounded-md border border-[--color-border] object-cover"
        />
      ) : null}
      <dl className="min-w-0 flex-1 space-y-1 rounded-md bg-white/70 p-2 text-xs">
        {shown.map((f) => (
          <div key={f.key} className="flex justify-between gap-3">
            <dt className="shrink-0 text-[--color-muted-foreground]">{f.label}</dt>
            <dd className={cn("truncate text-right font-medium", (f.kind === "vin" || f.kind === "cnp") && "font-mono")}>
              {f.kind === "boolean" ? (data[f.key] ? "Da" : "Nu") : String(data[f.key])}
            </dd>
          </div>
        ))}
        {document.validation_errors.length ? (
          <p className="pt-1 text-amber-700">{document.validation_errors[0].message}</p>
        ) : null}
      </dl>
    </div>
  );
}

function ScanningPreview({ preview }: { preview: Preview | null }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative overflow-hidden rounded-lg border border-violet-200 bg-violet-50/60">
      {preview?.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img src={preview.url} alt="" className="h-40 w-full object-cover opacity-80" />
      ) : (
        <div className="grid h-40 place-items-center text-violet-400">
          <FileText className="h-10 w-10" aria-hidden />
        </div>
      )}
      {reduceMotion ? null : (
        <motion.div
          aria-hidden
          className="absolute inset-x-0 h-0.5 bg-violet-500 shadow-[0_0_14px_3px_rgba(139,92,246,0.55)]"
          animate={{ top: ["6%", "94%", "6%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-violet-950/80 to-transparent px-3 pb-2 pt-6 text-xs font-medium text-white"
        role="status"
        aria-live="polite"
      >
        <ScanText className="h-3.5 w-3.5" aria-hidden />
        Claude Vision citește documentul…
      </div>
    </div>
  );
}

function ReviewPanel({
  result,
  preview,
  fields,
  kindTitle,
  values,
  onChange,
  onConfirm,
  onRetake,
  onCancel,
  saving,
}: {
  result: OcrData;
  preview: Preview | null;
  fields: FieldDef[];
  kindTitle: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onConfirm: () => void;
  onRetake: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const tier = tierFor(result.confidence);
  const needsRetake = tier === "low" || !result.document_matches_type;
  const demo = result.provider.includes("demo");

  return (
    <motion.div
      className="space-y-3 rounded-lg"
      initial={false}
      animate={
        tier === "high" && !reduceMotion
          ? { boxShadow: ["0 0 0 0 rgba(139,92,246,0.45)", "0 0 0 14px rgba(139,92,246,0)"] }
          : undefined
      }
      transition={{ duration: 1.1, ease: "easeOut" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        {preview?.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={preview.url} alt="" className="h-10 w-14 rounded border border-[--color-border] object-cover" />
        ) : null}
        <span className="flex items-center gap-1.5 text-sm font-semibold text-violet-700">
          <Sparkles className="h-4 w-4" aria-hidden /> Date extrase automat
        </span>
        <ConfidenceBadge confidence={result.confidence} />
        {demo ? <Badge variant="accent" size="sm">OCR demo</Badge> : null}
      </div>

      {!result.document_matches_type ? (
        <Alert variant="warning">
          <AlertDescription>
            Pare să fie {result.detected_document ?? "alt document"}, nu {kindTitle.toLowerCase()}. Verifică dacă ai
            fotografiat documentul corect.
          </AlertDescription>
        </Alert>
      ) : tier === "low" ? (
        <Alert variant="danger">
          <AlertDescription>
            Imaginea nu e destul de clară. Refă fotografia cu tot documentul în cadru, pe o suprafață plană și fără
            reflexii.
          </AlertDescription>
        </Alert>
      ) : tier === "medium" ? (
        <p className="text-xs text-amber-800">Verifică câmpurile marcate înainte de confirmare.</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f, i) => {
          const flag = result.field_flags[f.key];
          const id = `${result.upload_id}-${f.key}`;
          return (
            <motion.div
              key={f.key}
              className="space-y-1"
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.035, duration: 0.2 }}
            >
              <Label htmlFor={id} className="flex items-center gap-1.5 text-xs">
                {f.label}
                {flag === "check" ? (
                  <span className="rounded bg-amber-500/15 px-1.5 text-[10px] font-medium text-amber-700">verifică</span>
                ) : flag === "missing" && f.key_field ? (
                  <span className="rounded bg-slate-200/70 px-1.5 text-[10px] font-medium text-slate-600">lipsește</span>
                ) : null}
              </Label>
              {f.kind === "boolean" ? (
                <select
                  id={id}
                  value={values[f.key] ?? ""}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-[--color-input] bg-white px-3 text-sm"
                >
                  <option value="">Necunoscut</option>
                  <option value="true">Da</option>
                  <option value="false">Nu</option>
                </select>
              ) : (
                <Input
                  id={id}
                  value={values[f.key] ?? ""}
                  inputMode={f.kind === "number" || f.kind === "cnp" ? "numeric" : undefined}
                  placeholder={f.kind === "date" ? "AAAA-LL-ZZ" : undefined}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className={cn(
                    (f.kind === "vin" || f.kind === "cnp") && "font-mono tracking-wide",
                    flag === "check" && "border-amber-300 bg-amber-50/60",
                  )}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        {needsRetake ? (
          <>
            <Button type="button" className="min-h-11 flex-1" onClick={onRetake} disabled={saving}>
              <Camera className="h-4 w-4" aria-hidden /> Refă fotografia
            </Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={onConfirm} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Confirmă oricum
            </Button>
          </>
        ) : (
          <>
            <Button type="button" className="min-h-11 flex-1" onClick={onConfirm} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileCheck2 className="h-4 w-4" aria-hidden />}
              Confirmă datele
            </Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={onRetake} disabled={saving}>
              <Camera className="h-4 w-4" aria-hidden /> Refă
            </Button>
          </>
        )}
        <Button type="button" variant="ghost" className="min-h-11" onClick={onCancel} disabled={saving}>
          Anulează
        </Button>
      </div>
    </motion.div>
  );
}
