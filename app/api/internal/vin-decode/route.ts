import { NextResponse } from "next/server";
import { VinSchema } from "@/lib/validators";

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

type NhtsaItem = { Variable: string; Value: string | null };
type NhtsaResp = { Results: NhtsaItem[] };

function pick(items: NhtsaItem[], key: string): string | undefined {
  const found = items.find((i) => i.Variable === key);
  return found?.Value && found.Value !== "Not Applicable" ? found.Value : undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const vinRaw = url.searchParams.get("vin");
  const parsed = VinSchema.safeParse(vinRaw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "invalid_request", message: parsed.error.issues[0].message },
        meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      },
      { status: 400 },
    );
  }
  const vin = parsed.data;

  try {
    const res = await fetch(`${NHTSA_BASE}/DecodeVin/${vin}?format=json`, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    const json = (await res.json()) as NhtsaResp;
    const items = json.Results ?? [];

    const yearStr = pick(items, "Model Year");
    const engineCcStr = pick(items, "Displacement (CC)");
    const powerKwStr = pick(items, "Engine Power (kW)");
    const data = {
      vin,
      make: pick(items, "Make"),
      model: pick(items, "Model"),
      year: yearStr ? Number(yearStr) : undefined,
      fuel_type: pick(items, "Fuel Type - Primary"),
      engine_capacity_cc: engineCcStr ? Math.round(Number(engineCcStr)) : undefined,
      power_kw: powerKwStr ? Math.round(Number(powerKwStr)) : undefined,
      body_class: pick(items, "Body Class"),
      country: pick(items, "Plant Country"),
      manufacturer: pick(items, "Manufacturer Name"),
      euro_standard: pick(items, "Other Engine Info"),
    };

    return NextResponse.json({
      data,
      error: null,
      meta: {
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: "NHTSA",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "upstream_unavailable",
          message: "NHTSA nu răspunde momentan. Încearcă din nou în câteva secunde.",
        },
        meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      },
      { status: 502 },
    );
  }
}
