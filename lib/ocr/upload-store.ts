import type { DocumentType } from "@/types/domain";
import type { FieldValue, RawExtraction } from "./document-kinds";

export type PendingUpload = {
  id: string;
  owner_id: string;
  case_id: string;
  type: DocumentType;
  mime_type: string;
  bytes: Uint8Array;
  file_hash: string;
  provider: string;
  raw: RawExtraction;
  fields: Record<string, FieldValue>;
  confidence: number;
  created_at: number;
};

export type StoredFile = { mime_type: string; bytes: Uint8Array; owner_id: string };

type Stores = {
  pending: Map<string, PendingUpload>;
  files: Map<string, StoredFile>;
};

const PENDING_TTL_MS = 30 * 60 * 1000;

// Route handlers and Server Actions can load separate module instances, so the
// demo store lives on globalThis to be shared between them.
const g = globalThis as typeof globalThis & { __autoacteOcrStores?: Stores };
const stores: Stores = (g.__autoacteOcrStores ??= { pending: new Map(), files: new Map() });

function sweep() {
  const cutoff = Date.now() - PENDING_TTL_MS;
  for (const [id, upload] of stores.pending) {
    if (upload.created_at < cutoff) stores.pending.delete(id);
  }
}

export function savePendingUpload(upload: PendingUpload) {
  sweep();
  stores.pending.set(upload.id, upload);
}

export function takePendingUpload(id: string, ownerId: string): PendingUpload | null {
  const upload = stores.pending.get(id);
  if (!upload || upload.owner_id !== ownerId) return null;
  stores.pending.delete(id);
  return upload;
}

export function storeFile(documentId: string, file: StoredFile) {
  stores.files.set(documentId, file);
}

export function getStoredFile(documentId: string): StoredFile | null {
  return stores.files.get(documentId) ?? null;
}

export function deleteStoredFile(documentId: string) {
  stores.files.delete(documentId);
}
