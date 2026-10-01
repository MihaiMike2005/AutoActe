import { z } from "zod";

export const VinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(17, "VIN-ul trebuie să aibă exact 17 caractere")
  .regex(/^[A-HJ-NPR-Z0-9]+$/i, "VIN-ul conține caractere invalide (I, O, Q nu sunt permise)");

export const CnpSchema = z
  .string()
  .trim()
  .length(13, "CNP-ul trebuie să aibă 13 cifre")
  .regex(/^[1-8]\d{12}$/, "CNP invalid");

const CNP_WEIGHTS = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

export function isValidCnp(value: string): boolean {
  const cnp = value.trim();
  if (!/^[1-8]\d{12}$/.test(cnp)) return false;
  const sum = CNP_WEIGHTS.reduce((acc, w, i) => acc + w * Number(cnp[i]), 0);
  const control = sum % 11 === 10 ? 1 : sum % 11;
  return control === Number(cnp[12]);
}

export function isValidVin(value: string): boolean {
  return VinSchema.safeParse(value).success;
}

export const PhoneRoSchema = z
  .string()
  .trim()
  .regex(/^(\+?40|0)7\d{8}$/, "Număr de telefon mobil invalid (format: 07xxxxxxxx)");

export const PlateRoSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/, "Format plăcuță invalid (ex: CJ 12 ABC)");

export const ScenarioSchema = z.enum([
  "new_ro",
  "used_ro",
  "imported_eu",
  "imported_non_eu",
]);

export const DocumentTypeSchema = z.enum([
  "id_card",
  "brief_foreign",
  "kaufvertrag",
  "coc",
  "civ",
  "rca_policy",
  "itp_certificate",
  "ownership_contract",
  "tva_certificate",
  "fiscal_certificate",
  "translation",
  "other",
]);

export const LoginSchema = z.object({
  email: z.string().trim().email("Email invalid"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
});

export const RegisterSchema = LoginSchema.extend({
  full_name: z.string().trim().min(3, "Numele complet este obligatoriu"),
  cnp: CnpSchema.optional().or(z.literal("")),
  phone: PhoneRoSchema.optional().or(z.literal("")),
  county: z.string().optional(),
});

export const TwoFactorSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Codul are 6 cifre")
    .regex(/^\d{6}$/, "Doar cifre"),
});

export const NewCaseSchema = z.object({
  scenario: ScenarioSchema,
  vin: VinSchema,
  imported_from_country: z.string().optional(),
  purchase_value_ron: z.coerce.number().positive().optional(),
});

export const VehicleProfileSchema = z.object({
  vin: VinSchema,
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  fuel_type: z.string().optional(),
  engine_capacity_cc: z.coerce.number().int().positive().optional(),
  power_kw: z.coerce.number().int().positive().optional(),
  co2_emissions_g_km: z.coerce.number().int().nonnegative().optional(),
  euro_standard: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type TwoFactorInput = z.infer<typeof TwoFactorSchema>;
export type NewCaseInput = z.infer<typeof NewCaseSchema>;
export type VehicleProfileInput = z.infer<typeof VehicleProfileSchema>;
