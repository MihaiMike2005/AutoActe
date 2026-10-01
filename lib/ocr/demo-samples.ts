import type { DocumentType, Profile, RegistrationScenario } from "@/types/domain";
import type { FieldValue, RawExtraction } from "./document-kinds";

const DEMO_VIN = "WVWZZZCDZMW012345";

function isoDaysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { first: parts.slice(0, -1).join(" ") || parts[0], last: parts.at(-1) ?? "" };
}

function sample(fields: Record<string, FieldValue>, quality: RawExtraction["image_quality"] = "good"): RawExtraction {
  return {
    fields,
    image_quality: quality,
    document_matches_type: true,
    detected_document: null,
    unreadable_fields: [],
  };
}

export function demoExtraction(
  type: DocumentType,
  ctx: { scenario: RegistrationScenario; citizen?: Profile },
): RawExtraction {
  const citizenName = ctx.citizen?.full_name ?? "Andrei Popescu";
  const { first, last } = splitName(citizenName);
  const buyer = `${last.toUpperCase()} ${first.toUpperCase()}`;
  const privateSeller = ctx.scenario === "new_ro" ? "Auto Bavaria Cluj SRL" : "IONESCU MIHAI";

  switch (type) {
    case "id_card":
      return sample({
        last_name: last.toUpperCase(),
        first_name: first.toUpperCase(),
        cnp: ctx.citizen?.cnp ?? "1900101120128",
        birth_date: "1990-01-01",
        address: ctx.citizen?.address
          ? `${ctx.citizen.city ?? ""} ${ctx.citizen.address}`.trim()
          : "Mun. Cluj-Napoca, Str. Memorandumului nr. 18, ap. 7",
        series: "CX",
        number: "482913",
        issuing_authority: "SPCLEP Cluj-Napoca",
        issue_date: "2021-01-12",
        expiry_date: "2031-01-01",
      });
    case "brief_foreign":
      return sample({
        vin: DEMO_VIN,
        make: "VOLKSWAGEN",
        model: "Golf",
        first_registration_date: "2021-06-15",
        owner_name: "Schneider, Thomas",
        owner_address: "Kastanienallee 12, 10435 Berlin",
        engine_capacity_cc: 1498,
        power_kw: 110,
        mass_kg: 1320,
        fuel_type: "Benzin",
        co2_emissions_g_km: 128,
        euro_standard: "EURO 6d",
        color: "Grau",
        issuing_country: "DE",
        document_number: "AB1234567",
      });
    case "kaufvertrag":
      return sample(
        {
          seller_name: "Thomas Schneider",
          seller_address: "Kastanienallee 12, 10435 Berlin",
          buyer_name: buyer,
          buyer_address: ctx.citizen?.city ?? "Cluj-Napoca",
          vin: DEMO_VIN,
          make: "VW",
          model: "Golf 1.5 TSI",
          price: 18500,
          currency: "EUR",
          contract_date: isoDaysFromNow(-12),
          mileage_km: 48210,
          invoice_number: null,
        },
        "fair",
      );
    case "ownership_contract":
      return sample({
        seller_name: privateSeller,
        seller_address: "Cluj-Napoca",
        buyer_name: buyer,
        buyer_address: ctx.citizen?.city ?? "Cluj-Napoca",
        vin: DEMO_VIN,
        make: "Volkswagen",
        model: "Golf",
        price: ctx.scenario === "new_ro" ? 124900 : 82000,
        currency: "RON",
        contract_date: isoDaysFromNow(-5),
        mileage_km: ctx.scenario === "new_ro" ? 12 : 48210,
        invoice_number: ctx.scenario === "new_ro" ? "ABV-2026-00871" : null,
      });
    case "coc":
      return sample({
        vin: DEMO_VIN,
        make: "Volkswagen",
        model: "Golf",
        vehicle_category: "M1",
        type_approval_number: "e1*2007/46*1747*21",
        engine_capacity_cc: 1498,
        power_kw: 110,
        mass_kg: 1320,
        fuel_type: "Petrol",
        co2_emissions_g_km: 128,
        euro_standard: "Euro 6d",
      });
    case "civ":
      return sample({
        civ_series: "J512348",
        vin: DEMO_VIN,
        make: "VOLKSWAGEN",
        model: "GOLF",
        vehicle_category: "M1",
        manufacture_year: 2021,
        engine_capacity_cc: 1498,
        power_kw: 110,
        mass_kg: 1320,
        fuel_type: "Benzină",
        color: "Gri",
        euro_standard: "EURO 6",
        owner_name: ctx.scenario === "new_ro" ? null : privateSeller,
      });
    case "rca_policy":
      return sample({
        policy_number: "RO/25/Z25/HX/0012345",
        insurer: "Allianz-Țiriac Asigurări",
        insured_name: buyer,
        vin: DEMO_VIN,
        license_plate: null,
        valid_from: isoDaysFromNow(-1),
        valid_to: isoDaysFromNow(364),
      });
    case "itp_certificate":
      return sample({
        vin: DEMO_VIN,
        license_plate: null,
        inspection_date: isoDaysFromNow(-20),
        valid_until: isoDaysFromNow(710),
        inspection_station: "RAR Cluj",
        mileage_km: 48150,
      });
    case "fiscal_certificate":
      return sample({
        holder_name: privateSeller,
        holder_id: null,
        issuer: "DGITL Cluj-Napoca",
        issue_date: isoDaysFromNow(-3),
        certificate_number: "CF-2026-88412",
        no_outstanding_debts: true,
        vin: DEMO_VIN,
      });
    default:
      return sample({
        document_title: "Traducere legalizată",
        issuer: "Traduceri Legalizate Express",
        holder_name: citizenName,
        issue_date: isoDaysFromNow(-2),
        reference_number: "TR-2026-0419",
        vin: DEMO_VIN,
      });
  }
}
