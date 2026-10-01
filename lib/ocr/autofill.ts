import type { DocumentType, RegistrationCase, Vehicle } from "@/types/domain";
import type { FieldValue } from "./document-kinds";

const VEHICLE_SOURCES: DocumentType[] = ["brief_foreign", "civ", "coc"];
const SALE_SOURCES: DocumentType[] = ["kaufvertrag", "ownership_contract"];

const FUEL_NAMES: Array<[RegExp, string]> = [
  [/diesel|motorin/i, "Diesel"],
  [/benzin|petrol|gasoline/i, "Benzină"],
  [/elektr|electric/i, "Electric"],
  [/hybrid|hibrid/i, "Hibrid"],
  [/lpg|gpl|autogas/i, "GPL"],
];

export const AUTOFILL_LABELS: Record<string, string> = {
  vin: "VIN",
  make: "Marcă",
  model: "Model",
  year: "An",
  fuel_type: "Combustibil",
  engine_capacity_cc: "Cilindree",
  power_kw: "Putere",
  mass_kg: "Masă",
  co2_emissions_g_km: "CO₂",
  euro_standard: "Normă Euro",
  color: "Culoare",
  imported_from_country: "Țară de proveniență",
  purchase_price: "Preț achiziție",
  mileage_km: "Kilometraj",
};

function normalizeFuel(value: string) {
  return FUEL_NAMES.find(([re]) => re.test(value))?.[1] ?? value;
}

function isPlaceholderVehicle(v: Vehicle) {
  return !v.make || v.make === "—";
}

function str(value: FieldValue | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function num(value: FieldValue | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function applyAutofill(
  type: DocumentType,
  fields: Record<string, FieldValue>,
  vehicle: Vehicle,
  c: RegistrationCase,
): string[] {
  const filled: string[] = [];
  const placeholder = isPlaceholderVehicle(vehicle);

  const set = <K extends keyof Vehicle>(key: K, value: Vehicle[K] | undefined) => {
    if (value === undefined || value === null) return;
    const current = vehicle[key];
    const empty =
      current === undefined ||
      current === null ||
      current === "" ||
      (key === "vin" && String(current).startsWith("UNKNOWN")) ||
      (placeholder && (key === "make" || key === "model" || key === "year"));
    if (!empty || current === value) return;
    vehicle[key] = value;
    filled.push(key);
  };

  if (VEHICLE_SOURCES.includes(type)) {
    set("vin", str(fields.vin));
    set("make", str(fields.make));
    set("model", str(fields.model));
    const firstReg = str(fields.first_registration_date);
    const year = num(fields.manufacture_year) ?? (firstReg ? Number(firstReg.slice(0, 4)) : undefined);
    set("year", year && year > 1950 ? year : undefined);
    const fuel = str(fields.fuel_type);
    set("fuel_type", fuel ? normalizeFuel(fuel) : undefined);
    set("engine_capacity_cc", num(fields.engine_capacity_cc));
    set("power_kw", num(fields.power_kw));
    set("mass_kg", num(fields.mass_kg));
    set("co2_emissions_g_km", num(fields.co2_emissions_g_km));
    set("euro_standard", str(fields.euro_standard));
    set("color", str(fields.color));
    set("category", str(fields.vehicle_category));
    if (type === "brief_foreign" && c.scenario.startsWith("imported")) {
      set("imported_from_country", str(fields.issuing_country)?.toUpperCase());
    }
  }

  if (SALE_SOURCES.includes(type)) {
    set("vin", str(fields.vin));
    const price = num(fields.price);
    if (price && c.metadata.purchase_price === undefined) {
      c.metadata.purchase_price = { amount: price, currency: str(fields.currency) ?? "EUR" };
      filled.push("purchase_price");
    }
    const km = num(fields.mileage_km);
    if (km && c.metadata.mileage_km === undefined) {
      c.metadata.mileage_km = km;
      filled.push("mileage_km");
    }
  }

  return filled;
}
