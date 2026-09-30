/**
 * Romanian local vehicle tax ("impozit auto") — Codul Fiscal art. 470.
 * Brackets are RON per 200 cm³, applied to passenger cars (category M1).
 */

type Bracket = { upTo: number; ronPer200cc: number };

const M1_BRACKETS: Bracket[] = [
  { upTo: 1600, ronPer200cc: 8 },
  { upTo: 2000, ronPer200cc: 18 },
  { upTo: 2600, ronPer200cc: 72 },
  { upTo: 3000, ronPer200cc: 144 },
  { upTo: Infinity, ronPer200cc: 290 },
];

export function annualImpozit(engineCapacityCc: number): number {
  if (!engineCapacityCc || engineCapacityCc <= 0) return 0;
  const bracket = M1_BRACKETS.find((b) => engineCapacityCc <= b.upTo)!;
  const units = Math.ceil(engineCapacityCc / 200);
  return units * bracket.ronPer200cc;
}

export function impozitBreakdown(engineCapacityCc: number) {
  const bracket = M1_BRACKETS.find((b) => engineCapacityCc <= b.upTo)!;
  const units = Math.ceil(engineCapacityCc / 200);
  return {
    bracketLabel: `≤ ${bracket.upTo === Infinity ? "∞" : bracket.upTo} cm³`,
    ronPer200cc: bracket.ronPer200cc,
    units,
    total: units * bracket.ronPer200cc,
  };
}
