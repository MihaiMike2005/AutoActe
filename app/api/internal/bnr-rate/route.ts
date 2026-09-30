import { NextResponse } from "next/server";

const BNR_URL = "https://www.bnr.ro/nbrfxrates.xml";

function pickRate(xml: string, currency: string): number | null {
  const re = new RegExp(`<Rate currency="${currency}"[^>]*>([0-9.]+)</Rate>`);
  const m = xml.match(re);
  return m ? Number(m[1]) : null;
}

export async function GET() {
  try {
    const res = await fetch(BNR_URL, { next: { revalidate: 60 * 60 * 6 } });
    const text = await res.text();
    const eur = pickRate(text, "EUR");
    const usd = pickRate(text, "USD");
    return NextResponse.json({
      data: { eur_ron: eur, usd_ron: usd, source: "BNR" },
      error: null,
      meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
    });
  } catch {
    return NextResponse.json(
      {
        data: null,
        error: { code: "upstream_unavailable", message: "BNR temporar indisponibil." },
        meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      },
      { status: 502 },
    );
  }
}
