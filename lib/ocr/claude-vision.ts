import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { env } from "@/lib/env";
import { documentKind, extractionSchemaFor, type FieldValue, type RawExtraction } from "./document-kinds";
import type { DocumentType } from "@/types/domain";

export const OCR_MODEL = process.env.ANTHROPIC_OCR_MODEL || "claude-sonnet-5-5";

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type ImageMime = (typeof IMAGE_MIME_TYPES)[number];
export type OcrMime = ImageMime | "application/pdf";

export type OcrErrorCode = "refused" | "rate_limited" | "auth" | "rejected_input" | "invalid_output" | "upstream";

export class OcrError extends Error {
  constructor(
    public code: OcrErrorCode,
    message: string,
  ) {
    super(message);
  }
}

const SYSTEM = `You read photographed or scanned documents for AutoActe, a Romanian service that prepares vehicle registration files for citizens.

Report each field exactly as printed, with these conventions:
- Dates as YYYY-MM-DD.
- Numbers without thousands separators or units.
- Personal and company names in the order printed, keeping diacritics.
- VINs as 17 uppercase characters without spaces.

Use null for a field the document does not contain. When a field is present but you cannot read it with certainty, set it to null and add its key to unreadable_fields. Never fill a field from general knowledge or from another field; a wrong value is worse than a missing one, because a clerk relies on it.

Set document_matches_type to false when the image clearly shows a different document from the one requested, and name that document in detected_document (in Romanian). Rate image_quality as good when all text is sharp, fair when some text takes effort to read, and poor when blur, glare or cropping hides important fields.`;

let client: Anthropic | null = null;
function getClient() {
  return (client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }));
}

function sourceBlock(mimeType: OcrMime, data: string) {
  if (mimeType === "application/pdf") {
    return { type: "document" as const, source: { type: "base64" as const, media_type: mimeType, data } };
  }
  return { type: "image" as const, source: { type: "base64" as const, media_type: mimeType, data } };
}

export async function extractWithClaude(input: {
  type: DocumentType;
  mimeType: OcrMime;
  base64: string;
}): Promise<RawExtraction> {
  const kind = documentKind(input.type);
  // The installed SDK does not type `fallbacks` yet; the API accepts it under this beta.
  const fallback = { fallbacks: "default" } as Record<string, unknown>;

  let response;
  try {
    response = await getClient().beta.messages.parse({
      model: OCR_MODEL,
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-07-01"],
      output_config: { effort: "low", format: betaZodOutputFormat(extractionSchemaFor(input.type)) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            sourceBlock(input.mimeType, input.base64),
            { type: "text", text: `Requested document: ${kind.description}` },
          ],
        },
      ],
      ...fallback,
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      throw new OcrError("rate_limited", "Serviciul OCR este aglomerat. Reîncearcă în câteva secunde.");
    }
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      throw new OcrError("auth", "Cheia Anthropic configurată pe server nu este validă.");
    }
    if (err instanceof Anthropic.BadRequestError) {
      throw new OcrError("rejected_input", "Fișierul nu a putut fi citit. Încearcă o fotografie JPG sau un PDF mai mic.");
    }
    if (err instanceof Anthropic.APIError) {
      throw new OcrError("upstream", "Claude Vision nu răspunde momentan. Reîncearcă.");
    }
    throw err;
  }

  if (response.stop_reason === "refusal") {
    throw new OcrError("refused", "Documentul nu a putut fi procesat automat. Completează datele manual.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new OcrError("invalid_output", "Nu am putut interpreta documentul. Refă fotografia, cu tot documentul în cadru.");
  }

  const parsed = response.parsed_output;
  const quality = parsed.image_quality.trim().toLowerCase();
  return {
    fields: parsed.fields as Record<string, FieldValue>,
    image_quality: quality === "good" || quality === "poor" ? quality : "fair",
    document_matches_type: parsed.document_matches_type,
    detected_document: parsed.detected_document,
    unreadable_fields: parsed.unreadable_fields,
  };
}
