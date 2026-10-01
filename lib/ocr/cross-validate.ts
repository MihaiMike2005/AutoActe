import { isValidCnp } from "@/lib/validators";
import { documentKind } from "./document-kinds";
import type { DocumentRecord, DocumentType, Profile, Vehicle } from "@/types/domain";

export type CheckStatus = "pass" | "warn" | "fail";

export type CrossCheck = {
  id: string;
  status: CheckStatus;
  title: string;
  detail: string;
  documents: DocumentType[];
};

type Ctx = {
  documents: DocumentRecord[];
  vehicle?: Vehicle;
  citizen?: Profile;
  today?: Date;
};

const SALE_TYPES: DocumentType[] = ["kaufvertrag", "ownership_contract"];

function text(doc: DocumentRecord | undefined, key: string): string | null {
  const v = doc?.ocr_extracted_data?.[key];
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export function normalizeName(name: string): string[] {
  return name
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(srl|sa|gmbh|ag|pfa|ii)\b/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u"))
    .sort();
}

export function namesMatch(a: string, b: string): boolean {
  const ta = normalizeName(a);
  const tb = normalizeName(b);
  if (!ta.length || !tb.length) return false;
  const [small, big] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const overlap = small.filter((t) => big.includes(t)).length;
  return overlap === small.length && overlap >= Math.min(2, small.length);
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

function parseDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function vinCheck({ documents, vehicle }: Ctx): CrossCheck | null {
  const sources: Array<{ label: string; vin: string; type?: DocumentType }> = [];
  for (const doc of documents) {
    const vin = text(doc, "vin");
    if (vin) sources.push({ label: documentKind(doc.type).title, vin: vin.replace(/\s/g, "").toUpperCase(), type: doc.type });
  }
  if (vehicle?.vin && !vehicle.vin.startsWith("UNKNOWN")) {
    sources.push({ label: "Profilul vehiculului", vin: vehicle.vin.toUpperCase() });
  }
  if (sources.length < 2) return null;

  const docTypes = sources.flatMap((s) => (s.type ? [s.type] : []));
  const distinct = new Set(sources.map((s) => s.vin));
  if (distinct.size === 1) {
    return {
      id: "vin",
      status: "pass",
      title: "VIN identic pe toate documentele",
      detail: `${sources.length} surse confirmă ${sources[0].vin}.`,
      documents: docTypes,
    };
  }
  const reference = sources[0].vin;
  const mismatches = sources.filter((s) => s.vin !== reference);
  return {
    id: "vin",
    status: "fail",
    title: "VIN diferit între documente",
    detail: `${sources[0].label}: ${reference}. ${mismatches.map((m) => `${m.label}: ${m.vin}`).join(". ")}.`,
    documents: docTypes,
  };
}

function sellerOwnerChecks({ documents }: Ctx): CrossCheck[] {
  const pairs: Array<[DocumentType, string, DocumentType]> = [
    ["brief_foreign", "owner_name", "kaufvertrag"],
    ["civ", "owner_name", "ownership_contract"],
  ];
  const checks: CrossCheck[] = [];
  for (const [ownerType, ownerKey, saleType] of pairs) {
    const owner = text(documents.find((d) => d.type === ownerType), ownerKey);
    const seller = text(documents.find((d) => d.type === saleType), "seller_name");
    if (!owner || !seller) continue;
    const ok = namesMatch(owner, seller);
    checks.push({
      id: `seller-${ownerType}`,
      status: ok ? "pass" : "warn",
      title: ok
        ? `Vânzătorul este proprietarul din ${documentKind(ownerType).title}`
        : `Vânzătorul diferă de proprietarul din ${documentKind(ownerType).title}`,
      detail: ok
        ? `${seller} apare pe ambele documente.`
        : `Proprietar înscris: ${owner}. Vânzător: ${seller}. Poate fi o revânzare prin dealer. Păstrează dovada lanțului de proprietate.`,
      documents: [ownerType, saleType],
    });
  }
  return checks;
}

function holderName(ctx: Ctx): { name: string; source: string } | null {
  const id = ctx.documents.find((d) => d.type === "id_card");
  const last = text(id, "last_name");
  const first = text(id, "first_name");
  if (last || first) return { name: [last, first].filter(Boolean).join(" "), source: "buletin" };
  if (ctx.citizen?.full_name) return { name: ctx.citizen.full_name, source: "contul tău" };
  return null;
}

function buyerCheck(ctx: Ctx): CrossCheck | null {
  const sale = ctx.documents.find((d) => SALE_TYPES.includes(d.type) && text(d, "buyer_name"));
  const buyer = text(sale, "buyer_name");
  const holder = holderName(ctx);
  if (!sale || !buyer || !holder) return null;
  const ok = namesMatch(buyer, holder.name);
  return {
    id: "buyer",
    status: ok ? "pass" : "fail",
    title: ok ? "Cumpărătorul este titularul dosarului" : "Cumpărătorul nu este titularul dosarului",
    detail: ok
      ? `${buyer} corespunde cu ${holder.source}.`
      : `Contractul e pe numele ${buyer}, dar dosarul e al lui ${holder.name}. Înmatricularea se face doar pe numele cumpărătorului.`,
    documents: [sale.type, ...(holder.source === "buletin" ? (["id_card"] as DocumentType[]) : [])],
  };
}

function idCardChecks({ documents, citizen, today = new Date() }: Ctx): CrossCheck[] {
  const id = documents.find((d) => d.type === "id_card");
  if (!id) return [];
  const checks: CrossCheck[] = [];

  const cnp = text(id, "cnp");
  if (cnp) {
    const valid = isValidCnp(cnp);
    checks.push({
      id: "cnp",
      status: valid ? "pass" : "fail",
      title: valid ? "CNP valid" : "CNP invalid",
      detail: valid
        ? "Cifra de control a CNP-ului este corectă."
        : `${cnp} nu trece verificarea cifrei de control. Verifică citirea sau refă fotografia.`,
      documents: ["id_card"],
    });
    if (valid && citizen?.cnp && citizen.cnp !== cnp) {
      checks.push({
        id: "cnp-account",
        status: "fail",
        title: "CNP-ul nu corespunde contului",
        detail: "Buletinul încărcat aparține altei persoane decât titularul contului.",
        documents: ["id_card"],
      });
    }
  }

  const expiry = parseDate(text(id, "expiry_date"));
  if (expiry) {
    const days = daysBetween(today, expiry);
    checks.push({
      id: "id-expiry",
      status: days < 0 ? "fail" : days < 30 ? "warn" : "pass",
      title: days < 0 ? "Buletinul a expirat" : days < 30 ? "Buletinul expiră curând" : "Buletin valabil",
      detail:
        days < 0
          ? `A expirat acum ${Math.abs(days)} zile. DGPCI nu acceptă acte expirate.`
          : `Valabil încă ${days} zile.`,
      documents: ["id_card"],
    });
  }
  return checks;
}

function dateChecks({ documents, today = new Date() }: Ctx): CrossCheck[] {
  const checks: CrossCheck[] = [];

  for (const sale of documents.filter((d) => SALE_TYPES.includes(d.type))) {
    const date = parseDate(text(sale, "contract_date"));
    if (date && daysBetween(today, date) > 0) {
      checks.push({
        id: `date-${sale.type}`,
        status: "fail",
        title: "Data contractului este în viitor",
        detail: `${documentKind(sale.type).title} are data ${text(sale, "contract_date")}.`,
        documents: [sale.type],
      });
    }
  }

  const rca = documents.find((d) => d.type === "rca_policy");
  const from = parseDate(text(rca, "valid_from"));
  const to = parseDate(text(rca, "valid_to"));
  if (from && to) {
    const active = daysBetween(from, today) >= 0 && daysBetween(today, to) >= 0;
    checks.push({
      id: "rca",
      status: active ? "pass" : "fail",
      title: active ? "Poliță RCA activă" : "Poliță RCA inactivă",
      detail: `Valabilă ${text(rca, "valid_from")} până la ${text(rca, "valid_to")}.`,
      documents: ["rca_policy"],
    });
  }

  const itp = documents.find((d) => d.type === "itp_certificate");
  const until = parseDate(text(itp, "valid_until"));
  if (until) {
    const ok = daysBetween(today, until) >= 0;
    checks.push({
      id: "itp",
      status: ok ? "pass" : "fail",
      title: ok ? "ITP valabil" : "ITP expirat",
      detail: `Valabil până la ${text(itp, "valid_until")}.`,
      documents: ["itp_certificate"],
    });
  }

  const fiscal = documents.find((d) => d.type === "fiscal_certificate");
  const noDebts = fiscal?.ocr_extracted_data?.no_outstanding_debts;
  if (typeof noDebts === "boolean") {
    checks.push({
      id: "fiscal",
      status: noDebts ? "pass" : "fail",
      title: noDebts ? "Fără datorii la bugetul local" : "Certificatul fiscal arată datorii",
      detail: noDebts
        ? "Vânzătorul are situația fiscală la zi pentru vehicul."
        : "Vehiculul nu poate fi transcris până nu se achită datoriile locale.",
      documents: ["fiscal_certificate"],
    });
  }
  return checks;
}

const ORDER: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2 };

export function crossValidate(ctx: Ctx): CrossCheck[] {
  const checks = [
    vinCheck(ctx),
    ...sellerOwnerChecks(ctx),
    buyerCheck(ctx),
    ...idCardChecks(ctx),
    ...dateChecks(ctx),
  ].filter((c): c is CrossCheck => c !== null);
  return checks.sort((a, b) => ORDER[a.status] - ORDER[b.status]);
}
