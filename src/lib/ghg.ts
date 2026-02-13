/**
 * EcoNova GHG Impact Calculator
 * Verified lifecycle methodology — full cycle to combustion
 *
 * Sources:
 * - IPCC 2006, Vol 5, Table 5.3 (open burning emission factors)
 * - IPCC 2006, Vol 2 (diesel combustion factor)
 * - IEA Mexico 2023 (electricity grid factor)
 * - PE stoichiometry: (C2H4)n → 85.7% carbon by mass
 */

// ============================================
// EMISSION FACTORS (kg CO2eq per unit)
// ============================================
export const FACTORS = {
  // Open burning of PE (IPCC 2006 Vol 5 Table 5.3)
  PE_BURN_CO2: 3.08, // kg CO2 per kg PE (98% oxidation of 85.7% C)
  PE_BURN_CH4: 0.0065, // kg CH4 per kg PE
  PE_BURN_N2O: 0.0005, // kg N2O per kg PE

  // Global Warming Potentials (IPCC AR5)
  GWP_CH4: 28,
  GWP_N2O: 265,

  // Diesel combustion (IPCC 2006 Vol 2)
  DIESEL_CO2: 3.15, // kg CO2 per kg diesel

  // Electricity Mexico grid (IEA 2023)
  ELECTRICITY_MX: 0.435, // kg CO2 per kWh

  // Pyrolysis process defaults (DY-500)
  DIESEL_PER_BATCH_L: 2, // liters diesel per batch (estimate)
  DIESEL_DENSITY: 0.85, // kg/L
  POWER_KW: 10.75, // total plant power consumption
  BATCH_HOURS: 8, // average batch duration

  // Oil product
  OIL_DENSITY: 0.85, // kg/L pyrolytic oil
  OIL_CO2_FACTOR: 3.15, // kg CO2 per kg oil burned (similar to diesel)

  // Char carbon sequestration
  PE_CARBON_FRACTION: 0.857, // 85.7% carbon in PE
  CHAR_CARBON_RETENTION: 0.15, // 15% of carbon trapped in char
  C_TO_CO2: 44 / 12, // molecular weight ratio
} as const;

// ============================================
// CALCULATION FUNCTIONS
// ============================================

export interface GHGResult {
  // Baseline (without EcoNova)
  baselineCO2: number;
  baselineCH4eq: number;
  baselineN2Oeq: number;
  baselineTotal: number;

  // Project (with EcoNova)
  processEmissions: number; // diesel + electricity
  oilCombustion: number; // when oil is eventually burned
  charSequestration: number; // carbon locked in char (negative)
  projectTotal: number;

  // Net
  avoided: number;
  reductionPercent: number;
  avoidedPerKgPE: number;

  // Input reference
  cleanPlasticKg: number;
  feedstockKg: number;
}

/**
 * Calculate full lifecycle GHG impact for a batch
 */
export function calculateGHG(params: {
  feedstockKg: number;
  contaminationPct: number;
  oilLiters: number;
  dieselConsumedL?: number;
  durationHours?: number;
}): GHGResult {
  const {
    feedstockKg,
    contaminationPct,
    oilLiters,
    dieselConsumedL,
    durationHours,
  } = params;

  const cleanPlasticKg = feedstockKg * (1 - contaminationPct / 100);

  // === BASELINE: Open burning ===
  const baselineCO2 = cleanPlasticKg * FACTORS.PE_BURN_CO2;
  const baselineCH4eq =
    cleanPlasticKg * FACTORS.PE_BURN_CH4 * FACTORS.GWP_CH4;
  const baselineN2Oeq =
    cleanPlasticKg * FACTORS.PE_BURN_N2O * FACTORS.GWP_N2O;
  const baselineTotal = baselineCO2 + baselineCH4eq + baselineN2Oeq;

  // === PROJECT: Pyrolysis full lifecycle ===
  // Diesel consumption
  const dieselL = dieselConsumedL ?? FACTORS.DIESEL_PER_BATCH_L;
  const dieselEmissions = dieselL * FACTORS.DIESEL_DENSITY * FACTORS.DIESEL_CO2;

  // Electricity consumption
  const hours = durationHours ?? FACTORS.BATCH_HOURS;
  const electricityEmissions =
    FACTORS.POWER_KW * hours * FACTORS.ELECTRICITY_MX;

  // Scale process emissions proportionally if batch is smaller than 500kg
  const scaleFactor = feedstockKg / 500;
  const processEmissions =
    dieselConsumedL != null
      ? dieselEmissions + electricityEmissions // Use actual data
      : (dieselEmissions + electricityEmissions) * scaleFactor; // Scale estimate

  // Oil combustion (when eventually burned as fuel)
  const oilCombustion =
    oilLiters * FACTORS.OIL_DENSITY * FACTORS.OIL_CO2_FACTOR;

  // Char carbon sequestration (negative emissions)
  const charSequestration =
    cleanPlasticKg *
    FACTORS.PE_CARBON_FRACTION *
    FACTORS.CHAR_CARBON_RETENTION *
    FACTORS.C_TO_CO2;

  const projectTotal = processEmissions + oilCombustion - charSequestration;

  // === NET ===
  const avoided = baselineTotal - projectTotal;
  const reductionPercent =
    baselineTotal > 0 ? (avoided / baselineTotal) * 100 : 0;
  const avoidedPerKgPE = cleanPlasticKg > 0 ? avoided / cleanPlasticKg : 0;

  return {
    baselineCO2,
    baselineCH4eq,
    baselineN2Oeq,
    baselineTotal,
    processEmissions,
    oilCombustion,
    charSequestration,
    projectTotal,
    avoided,
    reductionPercent,
    avoidedPerKgPE,
    cleanPlasticKg,
    feedstockKg,
  };
}

/**
 * Format GHG result for display
 */
export function formatGHG(result: GHGResult) {
  return {
    withoutEcoNova: `${result.baselineTotal.toFixed(1)} kg CO₂eq`,
    withEcoNova: `${result.projectTotal.toFixed(1)} kg CO₂eq`,
    avoided: `${result.avoided.toFixed(1)} kg CO₂eq`,
    reduction: `${result.reductionPercent.toFixed(0)}%`,
    perKg: `${result.avoidedPerKgPE.toFixed(2)} kg CO₂/kg PE`,
  };
}
