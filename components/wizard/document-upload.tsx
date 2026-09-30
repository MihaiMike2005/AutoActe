"use client";

import { Camera, Check, FileCheck2, FileText, Loader2, ScanText, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addStubDocumentAction } from "@/lib/cases/actions";
import type { DocumentRecord, DocumentType, RegistrationScenario } from "@/types/domain";
import { cn } from "@/lib/utils";

type DocSlot = {
  key: DocumentType;
  label: string;
  hint: string;
  required: boolean;
};

const DEFAULT_SLOTS: Record<RegistrationScenario, DocSlot[]> = {
  new_ro: [
    { key: "id_card",            label: "Carte de identitate", hint: "Față + verso, focus clar pe CNP", required: true },
    { key: "ownership_contract", label: "Factură achiziție",   hint: "De la dealer-ul autorizat",        required: true },
    { key: "civ",                label: "CIV",                  hint: "Cartea de identitate a vehiculului", required: true },
    { key: "coc",                label: "COC (omologare)",      hint: "Document UE de conformitate",       required: false },
  ],
  used_ro: [
    { key: "id_card",            label: "Carte de identitate",  hint: "Față + verso", required: true },
    { key: "civ",                label: "CIV vechi",            hint: "De la fostul proprietar", required: true },
    { key: "ownership_contract", label: "Contract vânzare",     hint: "Semnat în 2 exemplare", required: true },
    { key: "fiscal_certificate", label: "Certificat fiscal",    hint: "Eliberat de DGITL fost proprietar", required: true },
  ],
  imported_eu: [
    { key: "id_card",     label: "Carte de identitate", hint: "Față + verso", required: true },
    { key: "brief_foreign", label: "Brief / Fahrzeugbrief", hint: "Documentul de înmatriculare din UE", required: true },
    { key: "kaufvertrag", label: "Kaufvertrag / Contract", hint: "Contract de vânzare-cumpărare", required: true },
    { key: "coc",         label: "COC",                  hint: "Certificate of Conformity",      required: true },
    { key: "translation", label: "Traduceri legalizate", hint: "Pentru brief + kaufvertrag",     required: false },
  ],
  imported_non_eu: [
    { key: "id_card",     label: "Carte de identitate", hint: "Față + verso", required: true },
    { key: "brief_foreign", label: "Documente origine", hint: "Title sau echivalent", required: true },
    { key: "kaufvertrag", label: "Bill of sale",         hint: "Contract de vânzare", required: true },
    { key: "translation", label: "Traduceri + apostilă", hint: "Toate documentele",  required: true },
  ],
};

export function DocumentUploadStep({
  caseId,
  scenario,
  documents,
}: {
  caseId: string;
  scenario: RegistrationScenario;
  documents: DocumentRecord[];
}) {
  const slots = DEFAULT_SLOTS[scenario];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Documente necesare</h3>
          <p className="text-sm text-[--color-muted-foreground]">
            Fotografiază fiecare document — Claude Vision extrage datele și completează formularele.
          </p>
        </div>
        <Badge variant="accent" className="gap-1">
          <Sparkles className="h-3 w-3" /> OCR activ
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {slots.map((slot) => {
          const doc = documents.find((d) => d.type === slot.key);
          return <DocumentSlot key={slot.key} slot={slot} caseId={caseId} document={doc} />;
        })}
      </div>
    </div>
  );
}

function DocumentSlot({
  slot,
  caseId,
  document,
}: {
  slot: DocSlot;
  caseId: string;
  document?: DocumentRecord;
}) {
  const [pending, setPending] = useState(false);
  const uploaded = Boolean(document);
  const confidence = document?.ocr_confidence ?? null;
  const tone =
    confidence === null
      ? "border-[--color-border]"
      : confidence >= 0.9
        ? "border-emerald-200 bg-emerald-50/50"
        : confidence >= 0.7
          ? "border-amber-200 bg-amber-50/50"
          : "border-red-200 bg-red-50/50";

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={cn("rounded-xl border p-4 transition-colors", tone)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-lg",
              uploaded
                ? "bg-emerald-500/15 text-emerald-700"
                : "bg-[--color-primary]/10 text-[--color-primary]",
            )}
          >
            {uploaded ? <FileCheck2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold">
              {slot.label}
              {slot.required ? (
                <Badge variant="muted" size="sm">Obligatoriu</Badge>
              ) : (
                <Badge variant="outline" size="sm">Opțional</Badge>
              )}
            </div>
            <p className="text-xs text-[--color-muted-foreground]">{slot.hint}</p>
          </div>
        </div>
        {uploaded ? (
          <Badge variant={confidence! >= 0.9 ? "success" : confidence! >= 0.7 ? "warning" : "danger"}>
            <ScanText className="h-3 w-3" /> {(confidence! * 100).toFixed(0)}%
          </Badge>
        ) : null}
      </div>

      {uploaded ? (
        <div className="mt-3 space-y-1 rounded-md bg-white/70 p-2 text-xs">
          {Object.entries(document!.ocr_extracted_data ?? {})
            .slice(0, 4)
            .map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-[--color-muted-foreground]">{k}</span>
                <span className="font-mono">{String(v)}</span>
              </div>
            ))}
        </div>
      ) : (
        <form
          action={async (formData) => {
            setPending(true);
            try {
              await addStubDocumentAction(formData);
            } finally {
              setPending(false);
            }
          }}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <input type="hidden" name="case_id" value={caseId} />
          <input type="hidden" name="type" value={slot.key} />
          <Button type="submit" variant="outline" size="sm" className="flex-1" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Fotografiază (demo)
          </Button>
          <Button type="submit" variant="secondary" size="sm" className="flex-1" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Încarcă PDF
          </Button>
        </form>
      )}
    </motion.div>
  );
}
