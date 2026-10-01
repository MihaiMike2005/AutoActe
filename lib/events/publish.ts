import type { CloudEvent } from "@/types/domain";

export type EventType =
  | "ro.autoacte.document.uploaded"
  | "ro.autoacte.document.ocr_completed"
  | "ro.autoacte.document.validated"
  | "ro.autoacte.document.rejected";

const g = globalThis as typeof globalThis & { __autoacteOutbox?: CloudEvent[] };
export const demoOutbox: CloudEvent[] = (g.__autoacteOutbox ??= []);

export function publishEvent<T>(type: EventType, data: T): CloudEvent<T> {
  const event: CloudEvent<T> = {
    id: `evt_${crypto.randomUUID()}`,
    specversion: "1.0",
    type,
    source: "autoacte.ro",
    time: new Date().toISOString(),
    datacontenttype: "application/json",
    data,
  };
  demoOutbox.push(event);
  return event;
}
