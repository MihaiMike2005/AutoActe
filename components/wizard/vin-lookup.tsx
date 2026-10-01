"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { setVehicleProfileAction } from "@/lib/cases/actions";
import { AUTOFILL_LABELS } from "@/lib/ocr/autofill";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/domain";

export type AutofillInfo = { fields: string[]; sourceTitle: string; fresh: boolean };

const AUTOFILL_RING = "border-violet-300 bg-violet-50/60 ring-2 ring-violet-200";

type Decoded = {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  fuel_type?: string;
  engine_capacity_cc?: number;
  power_kw?: number;
  euro_standard?: string;
  manufacturer?: string;
  country?: string;
};

export function VinLookup({
  caseId,
  vehicle,
  autofill,
}: {
  caseId: string;
  vehicle: Vehicle;
  autofill?: AutofillInfo;
}) {
  const filled = new Set(autofill?.fields ?? []);
  const ring = (key: string) => cn(filled.has(key) && AUTOFILL_RING);
  const fresh = autofill?.fresh ?? false;
  const [vin, setVin] = useState(vehicle.vin?.startsWith("UNKNOWN") ? "" : vehicle.vin);
  const [data, setData] = useState<Decoded | null>(
    vehicle.make && vehicle.make !== "—"
      ? {
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          fuel_type: vehicle.fuel_type,
          engine_capacity_cc: vehicle.engine_capacity_cc,
          power_kw: vehicle.power_kw,
          euro_standard: vehicle.euro_standard,
        }
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/vin-decode?vin=${encodeURIComponent(vin.trim())}`);
      const json = await res.json();
      if (json.error) {
        setError(json.error.message);
      } else {
        setData(json.data);
      }
    } catch {
      setError("Eroare de rețea. Reîncearcă.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="vin">Serie de șasiu (VIN)</Label>
        <div className="flex gap-2">
          <Input
            id="vin"
            value={vin}
            maxLength={17}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="17 caractere — ex: WBA8E9C50KB123456"
            className="font-mono tracking-wider"
          />
          <Button type="button" onClick={decode} disabled={loading || vin.trim().length !== 17}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Decodează
          </Button>
        </div>
        <p className="text-xs text-[--color-muted-foreground]">
          Datele provin live de la <strong>NHTSA vPIC</strong> (Statele Unite — singura bază de date publică care
          acoperă toate VIN-urile internaționale).
        </p>
      </div>

      {autofill ? (
        <motion.div
          initial={fresh ? { opacity: 0, scale: 0.98 } : false}
          animate={
            fresh
              ? { opacity: 1, scale: 1, boxShadow: ["0 0 0 0 rgba(139,92,246,0.4)", "0 0 0 12px rgba(139,92,246,0)"] }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900"
          role="status"
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Completat automat din <strong>{autofill.sourceTitle}</strong>:{" "}
            {autofill.fields.map((f) => AUTOFILL_LABELS[f] ?? f).join(", ")}. Verifică și salvează profilul.
          </span>
        </motion.div>
      ) : null}

      {error ? (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {data ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4" /> Vehicul identificat
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-200/60 px-2 py-0.5 text-[11px] font-medium">
              <Sparkles className="h-3 w-3" /> Auto-completat
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-emerald-900/80 md:grid-cols-3">
            {(
              [
                ["Marcă", data.make],
                ["Model", data.model],
                ["An", data.year?.toString()],
                ["Combustibil", data.fuel_type],
                ["Cilindree", data.engine_capacity_cc ? `${data.engine_capacity_cc} cm³` : undefined],
                ["Putere", data.power_kw ? `${data.power_kw} kW` : undefined],
                ["Țară fabricație", data.country],
                ["Producător", data.manufacturer],
                ["Standard Euro", data.euro_standard],
              ] as Array<[string, string | undefined]>
            )
              .filter(([, v]) => Boolean(v))
              .map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-1">
                  <dt className="text-emerald-900/60">{k}:</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>
        </motion.div>
      ) : null}

      <form action={setVehicleProfileAction} className="space-y-4">
        <input type="hidden" name="case_id" value={caseId} />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5 md:col-span-3">
            <Label htmlFor="form-vin">VIN confirmat</Label>
            <Input
              id="form-vin"
              name="vin"
              defaultValue={data?.vin ?? vin}
              required
              className={cn("font-mono", ring("vin"))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="make">Marcă</Label>
            <Input
              id="make"
              name="make"
              defaultValue={data?.make ?? (vehicle.make !== "—" ? vehicle.make : "")}
              required
              className={ring("make")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              defaultValue={data?.model ?? (vehicle.model !== "—" ? vehicle.model : "")}
              required
              className={ring("model")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">An</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min="1950"
              max={new Date().getFullYear() + 1}
              defaultValue={data?.year ?? vehicle.year}
              required
              className={ring("year")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fuel_type">Combustibil</Label>
            <Input
              id="fuel_type"
              name="fuel_type"
              defaultValue={data?.fuel_type ?? vehicle.fuel_type ?? ""}
              className={ring("fuel_type")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="engine_capacity_cc">Cilindree (cm³)</Label>
            <Input
              id="engine_capacity_cc"
              name="engine_capacity_cc"
              type="number"
              min="0"
              defaultValue={data?.engine_capacity_cc ?? vehicle.engine_capacity_cc ?? ""}
              className={ring("engine_capacity_cc")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="power_kw">Putere (kW)</Label>
            <Input
              id="power_kw"
              name="power_kw"
              type="number"
              min="0"
              defaultValue={data?.power_kw ?? vehicle.power_kw ?? ""}
              className={ring("power_kw")}
            />
          </div>
          <div className="space-y-1.5 md:col-span-3">
            <Label htmlFor="euro_standard">Standard Euro</Label>
            <Input
              id="euro_standard"
              name="euro_standard"
              defaultValue={data?.euro_standard ?? vehicle.euro_standard ?? ""}
              className={ring("euro_standard")}
            />
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full md:w-auto">
          Salvează profilul vehiculului
        </Button>
      </form>
    </div>
  );
}
