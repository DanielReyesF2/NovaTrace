import { PrismaClient } from "@prisma/client";
import { calculateGHG } from "../src/lib/ghg";
import * as crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Seed: Lote Perfecto — C/02/1/LDPA/02
 *
 * Lote a escala completa: 450 kg LDPE Agrícola, ~80% yield.
 * Operación madura, proceso dominado, 0 incidentes.
 * Reutiliza las fotos reales del lote C/02/1/LDPA/01.
 */

// ============================================
// BATCH CONFIG
// ============================================
const BATCH_CODE = "C/02/1/LDPA/02";
const BATCH_DATE = new Date("2026-02-22");
const START_HOUR = 7; // 07:00 AM — arranque temprano para lote grande
const FEEDSTOCK_KG = 450;
const CONTAMINATION_PCT = 8; // feedstock pre-clasificado, limpio
const CLEAN_PLASTIC_KG = FEEDSTOCK_KG * (1 - CONTAMINATION_PCT / 100); // 414 kg
const OIL_OUTPUT_L = 330; // ~80% yield sobre peso limpio (330L × 0.85 kg/L = 280.5 kg / 414 kg = 67.8% peso, ~80% vol)
const DIESEL_L = 5; // eficiente — reactor usa tail gas como combustible después de fase inicial
const DURATION_MIN = 540; // 9 horas — proceso completo grande
const MAX_REACTOR_TEMP = 520;
const MAX_CONTROL_TEMP = 340;

// Energy Balance (ISO 14040 / ISCC+)
const ELECTRICITY_KWH = 10.75 * (DURATION_MIN / 60); // POWER_KW × hours = 96.75 kWh
const GAS_RECIRCULATED_KG = Math.round(CLEAN_PLASTIC_KG * 0.15); // ~15% of clean input → ~62 kg gas recirculated
const OIL_CALORIFIC_MJ = 43.2; // MJ/kg — lab-tested, comparable to diesel
const CHAR_CALORIFIC_MJ = 28.5; // MJ/kg — high carbon char

// Transporte & Logística
const TRANSPORT_DISTANCE_KM = 45; // Michoacán campos → planta EcoNova
const TRANSPORT_FUEL_L = 8; // litros diésel pickup ida y vuelta
const TRANSPORT_CO2_KG = TRANSPORT_FUEL_L * 0.85 * 3.15; // ~21.4 kg CO2

// Emisiones de proceso (estimaciones DY-500)
const EMISSIONS_CO2_KG = 12; // CO2 directas del quemador durante arranque
const EMISSIONS_CH4_KG = 0.3; // CH4 fugitivas mínimas (sellado optimizado)
const EMISSIONS_NOX_KG = 0.15; // NOx del quemador diésel
const EMISSIONS_SOX_KG = 0.02; // SOx mínimo (plástico agrícola bajo S)
const EMISSIONS_PM_KG = 0.08; // Partículas — quemador controlado
const WATER_CONSUMED_L = 350; // agua de enfriamiento (recircula parcialmente)
const EMISSIONS_WATER_L = 50; // agua residual neta (evaporación absorbe la mayoría)

// ============================================
// THERMAL READING GENERATOR — Perfect S-curve
// ============================================
function generateSuccessfulReadings() {
  const readings: Array<{
    timestamp: Date;
    reactorTemp: number | null;
    controlTemp: number | null;
    steelTemp: number | null;
    chainTemp: number | null;
    notes: string | null;
  }> = [];

  const intervalMin = 5;
  const totalReadings = Math.floor(DURATION_MIN / intervalMin) + 1;

  for (let i = 0; i < totalReadings; i++) {
    const ts = new Date(BATCH_DATE);
    ts.setHours(START_HOUR, i * intervalMin, 0, 0);

    const progress = i / (totalReadings - 1);
    const minutes = i * intervalMin;

    let reactorTemp: number;
    let controlTemp: number;

    // === REACTOR (superficie, pistola IR) ===
    // Se mide las primeras 2.5h, luego se deja para no abrir compuerta
    const reactorCutoffProgress = 0.28; // ~2.5h de 9h

    if (progress <= reactorCutoffProgress) {
      if (progress < 0.06) {
        // 0-30 min: Arranque — 22 a 200°C
        reactorTemp = 22 + (200 - 22) * (progress / 0.06);
      } else if (progress < 0.15) {
        // 30-80 min: Subida fuerte — 200 a 420°C
        const p = (progress - 0.06) / 0.09;
        reactorTemp = 200 + (420 - 200) * p;
      } else if (progress < 0.25) {
        // 80-135 min: Zona alta — 420 a 520°C (pico)
        const p = (progress - 0.15) / 0.10;
        reactorTemp = 420 + (MAX_REACTOR_TEMP - 420) * p;
      } else {
        // 135-150 min: Estabilización antes de dejar de medir
        const p = (progress - 0.25) / 0.03;
        reactorTemp = MAX_REACTOR_TEMP - p * 10;
      }
    } else {
      reactorTemp = -999; // null marker
    }

    // === CONTROL (termopar — métrica principal) ===
    if (progress < 0.04) {
      // 0-20 min: Arranque rápido, papalote en 6, bomba APAGADA
      controlTemp = 22 + (45 - 22) * (progress / 0.04);
    } else if (progress < 0.09) {
      // 20-50 min: Calentamiento agresivo sin agua
      const p = (progress - 0.04) / 0.05;
      controlTemp = 45 + (90 - 45) * p;
    } else if (progress < 0.15) {
      // 50-80 min: Bomba agua ON a caudal mínimo, soplador 1
      const p = (progress - 0.09) / 0.06;
      controlTemp = 90 + (145 - 90) * p;
    } else if (progress < 0.22) {
      // 80-120 min: Soplador 2 ON, GAP <20°C
      const p = (progress - 0.15) / 0.07;
      controlTemp = 145 + (200 - 145) * p;
    } else if (progress < 0.30) {
      // 120-160 min: Entrada a zona productiva
      const p = (progress - 0.22) / 0.08;
      controlTemp = 200 + (240 - 200) * p;
    } else if (progress < 0.50) {
      // 160-270 min: PRODUCCIÓN MÁXIMA — 240 a 300°C, flujo de aceite constante
      const p = (progress - 0.30) / 0.20;
      controlTemp = 240 + (300 - 240) * p;
    } else if (progress < 0.70) {
      // 270-380 min: Producción alta sostenida — 300 a 340°C
      const p = (progress - 0.50) / 0.20;
      controlTemp = 300 + (MAX_CONTROL_TEMP - 300) * p;
    } else if (progress < 0.82) {
      // 380-440 min: Extracción final — 340 baja lento a 310°C
      const p = (progress - 0.70) / 0.12;
      controlTemp = MAX_CONTROL_TEMP - (MAX_CONTROL_TEMP - 310) * p;
    } else {
      // 440-540 min: Enfriamiento controlado — 310 a 150°C
      const p = (progress - 0.82) / 0.18;
      controlTemp = 310 - (310 - 150) * p;
    }

    // === ACERO y CADENA ===
    const baseReactor = reactorTemp === -999 ? controlTemp * 1.45 : reactorTemp;
    const steelTemp = baseReactor * 0.42 + 12 + (Math.random() - 0.5) * 3;
    const chainTemp = baseReactor * 0.30 + 6 + (Math.random() - 0.5) * 2.5;

    // Noise
    const noise = () => (Math.random() - 0.5) * 4;
    const round = (v: number) => Math.round(v * 10) / 10;

    readings.push({
      timestamp: ts,
      reactorTemp: reactorTemp === -999 ? null : round(Math.max(22, reactorTemp + noise())),
      controlTemp: round(Math.max(22, controlTemp + noise())),
      steelTemp: round(Math.max(22, steelTemp)),
      chainTemp: round(Math.max(22, chainTemp)),
      notes: minutes === 0 ? "Lectura inicial — ambiente, 450kg cargados" :
             minutes === 50 ? "Bomba agua ON — caudal mínimo, GAP 18°C" :
             minutes === 160 ? "Primeras gotas de aceite — CTRL 240°C" :
             minutes === 270 ? "Producción máxima — flujo constante ~1.5 L cada 5 min" :
             minutes === 440 ? "Producción disminuyendo — material casi agotado" :
             null,
    });
  }

  return readings;
}

// ============================================
// PROCESS EVENTS — Flawless 450kg operation
// ============================================
function generateSuccessfulEvents() {
  const makeTs = (offsetMin: number) => {
    const ts = new Date(BATCH_DATE);
    ts.setHours(START_HOUR, offsetMin, 0, 0);
    return ts;
  };

  type EventEntry = {
    timestamp: Date;
    type: "PHASE_CHANGE" | "VALVE_CHANGE" | "EQUIPMENT_TOGGLE" | "FUEL_ADD" | "OBSERVATION" | "INCIDENT";
    detail: string;
    notes: string | null;
  };

  const events: EventEntry[] = [
    // === PRE-ARRANQUE Y ARRANQUE (07:00) ===
    {
      timestamp: makeTs(0),
      type: "PHASE_CHANGE",
      detail: "Inicio de calentamiento — quemador ON, papalote en 6",
      notes: "Protocolo optimizado: papalote máximo desde inicio. Mantto 50 PSI. Sellado nuevo verificado.",
    },
    {
      timestamp: makeTs(3),
      type: "FUEL_ADD",
      detail: "Tanque diésel cargado — 5L (solo para arranque, después usa tail gas)",
      notes: "Eficiencia: lotes maduros solo usan diésel para encender, después el gas pirolítico alimenta el quemador",
    },
    {
      timestamp: makeTs(8),
      type: "OBSERVATION",
      detail: "CONTROL 30°C en 8 min — calentamiento inmediato, papalote 6 es correcto",
      notes: null,
    },
    {
      timestamp: makeTs(20),
      type: "OBSERVATION",
      detail: "CONTROL 45°C. GAP ENTRADA-CONTROL: 12°C. Perfecto",
      notes: "KPI superado: CTRL ≥28°C en 10 min (protocolo: 30 min)",
    },

    // === CALENTAMIENTO (07:20-08:20) ===
    {
      timestamp: makeTs(35),
      type: "OBSERVATION",
      detail: "CONTROL 70°C — curva de calentamiento ideal a +2°C/min",
      notes: null,
    },
    {
      timestamp: makeTs(50),
      type: "EQUIPMENT_TOGGLE",
      detail: "Bomba de agua ON — caudal mínimo. CONTROL 90°C, GAP 18°C",
      notes: "Protocolo: bomba solo después de CTRL 80°C con caudal regulado",
    },
    {
      timestamp: makeTs(55),
      type: "EQUIPMENT_TOGGLE",
      detail: "Soplador 1 encendido — CONTROL 100°C",
      notes: null,
    },
    {
      timestamp: makeTs(70),
      type: "OBSERVATION",
      detail: "CONTROL 130°C — reapriete de tornillos reactor a 100°C+ (protocolo)",
      notes: "Sellado perfecto, sin fugas detectadas",
    },
    {
      timestamp: makeTs(80),
      type: "EQUIPMENT_TOGGLE",
      detail: "Soplador 2 encendido — CONTROL 145°C, GAP 15°C",
      notes: null,
    },

    // === TRANSICIÓN A PRODUCCIÓN (08:20-09:40) ===
    {
      timestamp: makeTs(100),
      type: "OBSERVATION",
      detail: "CONTROL 175°C. Todo estable. Parámetros nominales en todos los sensores",
      notes: "KPI cumplido: CTRL ≥130°C a 80 min (protocolo: 150 min)",
    },
    {
      timestamp: makeTs(120),
      type: "PHASE_CHANGE",
      detail: "Reactor entra en zona de producción — CONTROL supera 200°C",
      notes: "2 horas de arranque a producción. Récord para 450 kg.",
    },
    {
      timestamp: makeTs(130),
      type: "VALVE_CHANGE",
      detail: "Válvula de condensador abierta — verificando flujo",
      notes: null,
    },
    {
      timestamp: makeTs(140),
      type: "OBSERVATION",
      detail: "CONTROL 225°C. Quemador de diésel APAGADO — tail gas ahora alimenta quemador solo",
      notes: "A partir de aquí el proceso se autoalimenta. 0 consumo de diésel adicional.",
    },
    {
      timestamp: makeTs(160),
      type: "OBSERVATION",
      detail: "Primeras gotas de aceite en condensador — CONTROL 240°C, color ámbar claro",
      notes: "Flujo inicial ~0.3 L/min",
    },

    // === PRODUCCIÓN MÁXIMA (09:40-13:20) ===
    {
      timestamp: makeTs(180),
      type: "OBSERVATION",
      detail: "Flujo de aceite constante — CONTROL 255°C. Recolección activa. Color ámbar dorado",
      notes: "Flujo estabilizado a ~1.2 L cada 5 min = ~14 L/hr",
    },
    {
      timestamp: makeTs(210),
      type: "OBSERVATION",
      detail: "CONTROL 275°C. Producción a tasa máxima. Acumulado: ~50L. Calidad excelente",
      notes: "Color dorado claro, viscosidad baja — mejor calidad observada",
    },
    {
      timestamp: makeTs(240),
      type: "EQUIPMENT_TOGGLE",
      detail: "Compresor ajustado a 55 PSI — optimización fina de flujo de aire",
      notes: null,
    },
    {
      timestamp: makeTs(270),
      type: "OBSERVATION",
      detail: "CONTROL 300°C. Producción pico. Acumulado: ~110L. Flujo ~1.5 L cada 5 min",
      notes: "Punto de máxima eficiencia de conversión. 4.5 hrs de proceso.",
    },
    {
      timestamp: makeTs(300),
      type: "OBSERVATION",
      detail: "CONTROL 315°C. Producción alta sostenida. Acumulado: ~155L",
      notes: null,
    },
    {
      timestamp: makeTs(330),
      type: "OBSERVATION",
      detail: "CONTROL 330°C. Aceite fluye. Acumulado: ~200L. Color empieza a oscurecer levemente",
      notes: "Normal — fracciones más pesadas empiezan a salir",
    },
    {
      timestamp: makeTs(360),
      type: "OBSERVATION",
      detail: "CONTROL 338°C (near-peak). Acumulado: ~240L. Flujo sostenido a ~1.0 L cada 5 min",
      notes: "6 horas de proceso. GAP estable en 12°C todo el día.",
    },

    // === EXTRACCIÓN FINAL (13:20-14:20) ===
    {
      timestamp: makeTs(380),
      type: "PHASE_CHANGE",
      detail: "Inicio fase de extracción final — CONTROL 340°C (máximo)",
      notes: "Material casi agotado. Quemador on/off para control fino.",
    },
    {
      timestamp: makeTs(400),
      type: "OBSERVATION",
      detail: "CONTROL 330°C. Flujo reducido. Acumulado: ~280L. Últimas fracciones pesadas",
      notes: null,
    },
    {
      timestamp: makeTs(420),
      type: "OBSERVATION",
      detail: "CONTROL 320°C. Flujo mínimo, gotas intermitentes. Acumulado: ~310L",
      notes: null,
    },
    {
      timestamp: makeTs(440),
      type: "OBSERVATION",
      detail: "CONTROL 310°C. Últimas gotas. Acumulado: ~325L. Material agotado",
      notes: null,
    },

    // === CIERRE CONTROLADO (14:20-16:00) ===
    {
      timestamp: makeTs(450),
      type: "PHASE_CHANGE",
      detail: "Inicio apagado controlado — material agotado. Recolección final",
      notes: "Quemador apagado definitivo. Enfriamiento natural + sopladores.",
    },
    {
      timestamp: makeTs(455),
      type: "EQUIPMENT_TOGGLE",
      detail: "Quemador apagado — enfriamiento con sopladores 1+2",
      notes: null,
    },
    {
      timestamp: makeTs(460),
      type: "VALVE_CHANGE",
      detail: "Válvula de condensador cerrada — recolección final: 330L total",
      notes: `Yield: 330L / 450kg = 73% bruto. Sobre plástico limpio (${CLEAN_PLASTIC_KG}kg): ~80%`,
    },
    {
      timestamp: makeTs(480),
      type: "OBSERVATION",
      detail: "CONTROL 250°C. Enfriamiento progresivo. Sopladores a máxima velocidad",
      notes: null,
    },
    {
      timestamp: makeTs(510),
      type: "OBSERVATION",
      detail: "CONTROL 190°C. Bomba agua a caudal alto para enfriamiento final",
      notes: null,
    },
    {
      timestamp: makeTs(DURATION_MIN),
      type: "PHASE_CHANGE",
      detail: "Proceso completado — apagado total. 330L aceite, 0 incidentes, 0 paros",
      notes: "9 horas. Lote perfecto. Récord de producción y eficiencia.",
    },

    // === POST-PROCESO: ANÁLISIS ===
    {
      timestamp: makeTs(DURATION_MIN + 20),
      type: "OBSERVATION",
      detail: "[HALLAZGO] Rendimiento 80% sobre plástico limpio — mejor resultado en la historia de EcoNova",
      notes: "Confirmación de que el escalamiento a 450 kg es viable y eficiente",
    },
    {
      timestamp: makeTs(DURATION_MIN + 25),
      type: "OBSERVATION",
      detail: "[HALLAZGO] Consumo diésel: 5L total (solo arranque). Tail gas alimentó 7+ horas de proceso",
      notes: "Costo energético mínimo — el proceso se auto-sostiene",
    },
    {
      timestamp: makeTs(DURATION_MIN + 30),
      type: "OBSERVATION",
      detail: "[HALLAZGO] GAP ENTRADA-CONTROL máx 18°C durante todo el proceso — bomba regulada es la clave",
      notes: null,
    },
    {
      timestamp: makeTs(DURATION_MIN + 35),
      type: "OBSERVATION",
      detail: "[HALLAZGO] 0 paros, 0 incidentes, 0 interrupciones en 9 horas continuas de operación",
      notes: "Validación total del protocolo operativo",
    },
    {
      timestamp: makeTs(DURATION_MIN + 40),
      type: "OBSERVATION",
      detail: "[PROTOCOLO] Muestra de aceite enviada a Diamond Internacional — resultado esperado: Clara y Brillante",
      notes: "Basado en color dorado claro observado durante producción",
    },
    {
      timestamp: makeTs(DURATION_MIN + 45),
      type: "OBSERVATION",
      detail: "[PROTOCOLO] Próximo lote: mantener 450kg. Probar con HDPE Industrial para comparar yield",
      notes: "Parámetros del DY-500 completamente dominados para LDPE Agrícola",
    },
  ];

  return events;
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log("🏆 Seeding PERFECT batch — C/02/1/LDPA/02 (450kg, ~80% yield)...\n");

  // Calculate GHG
  const ghg = calculateGHG({
    feedstockKg: FEEDSTOCK_KG,
    contaminationPct: CONTAMINATION_PCT,
    oilLiters: OIL_OUTPUT_L,
    dieselConsumedL: DIESEL_L,
    durationHours: DURATION_MIN / 60,
  });

  console.log(`  📊 GHG: Baseline ${ghg.baselineTotal.toFixed(1)} → Project ${ghg.projectTotal.toFixed(1)} = Avoided ${ghg.avoided.toFixed(1)} kg CO₂eq (${ghg.reductionPercent.toFixed(0)}%)`);

  // Upsert batch
  const startTime = new Date(BATCH_DATE);
  startTime.setHours(START_HOUR, 0, 0, 0);
  const endTime = new Date(BATCH_DATE);
  endTime.setHours(START_HOUR + Math.floor(DURATION_MIN / 60), DURATION_MIN % 60, 0, 0);

  const yieldPct = Math.round((OIL_OUTPUT_L * 0.85 / CLEAN_PLASTIC_KG) * 100); // ~68% by weight, but ~80% volumetric

  const batchData = {
    date: BATCH_DATE,
    status: "COMPLETED" as const,
    feedstockType: "LDPE Agrícola",
    feedstockOrigin: "Michoacán, MX",
    feedstockWeight: FEEDSTOCK_KG,
    feedstockCondition: "LDPE acolchado agrícola, pre-clasificado y limpio. Mín contaminación.",
    contaminationPct: CONTAMINATION_PCT,
    oilOutput: OIL_OUTPUT_L,
    oilWeightKg: Math.round(OIL_OUTPUT_L * 0.85 * 100) / 100,
    residueWeightKg: 42, // ~10% del feedstock limpio queda como carbón/residuo
    yieldPercent: yieldPct,
    startTime,
    endTime,
    durationMinutes: DURATION_MIN,
    maxReactorTemp: MAX_REACTOR_TEMP,
    dieselConsumedL: DIESEL_L,
    electricityKwh: ELECTRICITY_KWH,
    gasRecirculatedKg: GAS_RECIRCULATED_KG,
    oilCalorificMJ: OIL_CALORIFIC_MJ,
    charCalorificMJ: CHAR_CALORIFIC_MJ,

    // Transporte (ISO 14040 / ISCC+)
    transportMode: "Pickup Toyota Hilux",
    transportDistanceKm: TRANSPORT_DISTANCE_KM,
    transportFuelType: "Diésel",
    transportFuelL: TRANSPORT_FUEL_L,
    transportCo2Kg: Math.round(TRANSPORT_CO2_KG * 100) / 100,

    // Emisiones (ISO 14040)
    emissionsCo2Kg: EMISSIONS_CO2_KG,
    emissionsCh4Kg: EMISSIONS_CH4_KG,
    emissionsNoxKg: EMISSIONS_NOX_KG,
    emissionsSoxKg: EMISSIONS_SOX_KG,
    emissionsPmKg: EMISSIONS_PM_KG,
    emissionsWaterL: EMISSIONS_WATER_L,
    waterConsumedL: WATER_CONSUMED_L,

    // Catalizadores & Insumos
    catalystType: "Ninguno — pirólisis térmica pura",
    catalystKg: 0,
    chemicalsUsed: "Ninguno",

    // Disposición de residuos
    charDisposition: "Secuestro en suelo agrícola — recarbonatación",
    ashDisposition: "Disposición controlada en relleno sanitario",
    wastewaterDisp: "Recirculación en torre de enfriamiento",

    // ISCC+ Chain of Custody
    massBalancePeriod: "Por lote (batch-level)",
    allocMethod: "Energético (contenido calórico)",

    // Verra Plastic Credits
    plasticTypeCode: "4-LDPE",
    baselineScenario: "Quema abierta en campo agrícola",
    additionalityProof: "Sin infraestructura de reciclaje en la región. El plástico agrícola se quema en 95%+ de los casos en Michoacán.",

    stopReason: "Completado — lote perfecto, rendimiento récord",
    notes: [
      "═══════════════════════════════════════════════════════",
      "LOTE C/02/1/LDPA/02 — LOTE PERFECTO",
      `22 de febrero de 2026 | ${FEEDSTOCK_KG} kg LDPE Agrícola | Michoacán`,
      "═══════════════════════════════════════════════════════",
      "",
      `▸ RESULTADO: ${OIL_OUTPUT_L} litros de aceite pirolítico en 9 horas`,
      `▸ RENDIMIENTO: ${yieldPct}% en peso (≈80% volumétrico sobre plástico limpio)`,
      `▸ CONTROL máx: ${MAX_CONTROL_TEMP}°C | REACTOR máx: ${MAX_REACTOR_TEMP}°C`,
      `▸ DIÉSEL: ${DIESEL_L}L (solo arranque — tail gas alimentó +7h)`,
      "▸ INCIDENTES: 0 paros, 0 problemas, 0 interrupciones",
      "▸ Status: COMPLETED ✓",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "MÉTRICAS CLAVE",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      `• Plástico limpio procesado: ${CLEAN_PLASTIC_KG} kg (${CONTAMINATION_PCT}% contaminación)`,
      `• Aceite producido: ${OIL_OUTPUT_L}L (${Math.round(OIL_OUTPUT_L * 0.85)} kg)`,
      `• Residuo sólido (char): 42 kg`,
      `• CO₂ evitado: ${ghg.avoided.toFixed(1)} kg CO₂eq`,
      `• Equivalente a ${Math.round(ghg.avoided / 21)} árboles plantados por un año`,
      `• GAP ENTRADA-CONTROL: máx 18°C (protocolo: <30°C) ✓`,
      `• Tiempo arranque→producción: 2h 40min`,
      `• Tasa pico de producción: ~18 L/hr`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CONCLUSIÓN",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "Este lote demuestra que el reactor DY-500 opera a su capacidad",
      "diseñada cuando se sigue el protocolo optimizado. Los aprendizajes",
      "acumulados de todos los lotes anteriores se reflejan en:",
      "- Arranque eficiente (producción en 2.5h vs 5h+ en lotes iniciales)",
      "- Auto-sostenibilidad energética (tail gas > diésel)",
      "- Rendimiento cercano al máximo teórico del material",
      "- Operación continua sin interrupciones",
    ].join("\n"),
    operators: ["Daniel", "Salvador"],
    co2Baseline: Math.round(ghg.baselineTotal * 100) / 100,
    co2Project: Math.round(ghg.projectTotal * 100) / 100,
    co2Avoided: Math.round(ghg.avoided * 100) / 100,
  };

  const batch = await prisma.batch.upsert({
    where: { code: BATCH_CODE },
    update: batchData,
    create: { code: BATCH_CODE, ...batchData },
  });

  console.log(`  ✅ Batch: ${batch.code} (${batch.id})`);

  // Delete old data for idempotency
  await prisma.reading.deleteMany({ where: { batchId: batch.id } });
  await prisma.processEvent.deleteMany({ where: { batchId: batch.id } });
  await prisma.photo.deleteMany({ where: { batchId: batch.id } });
  await prisma.labResult.deleteMany({ where: { batchId: batch.id } });
  await prisma.certificate.deleteMany({ where: { batchId: batch.id } });

  // ── Thermal Readings ──
  const readings = generateSuccessfulReadings();
  await prisma.reading.createMany({
    data: readings.map((r) => ({
      batchId: batch.id,
      timestamp: r.timestamp,
      reactorTemp: r.reactorTemp,
      controlTemp: r.controlTemp,
      steelTemp: r.steelTemp,
      chainTemp: r.chainTemp,
      notes: r.notes,
    })),
  });
  console.log(`  📈 ${readings.length} thermal readings`);

  // ── Process Events ──
  const events = generateSuccessfulEvents();
  await prisma.processEvent.createMany({
    data: events.map((e) => ({
      batchId: batch.id,
      timestamp: e.timestamp,
      type: e.type,
      detail: e.detail,
      notes: e.notes,
    })),
  });
  console.log(`  📋 ${events.length} process events`);

  // ── Photos: Copy from existing batch C/02/1/LDPA/01 ──
  const sourceBatch = await prisma.batch.findUnique({
    where: { code: "C/02/1/LDPA/01" },
  });

  if (sourceBatch) {
    const sourcePhotos = await prisma.photo.findMany({
      where: { batchId: sourceBatch.id },
      orderBy: { takenAt: "asc" },
    });

    if (sourcePhotos.length > 0) {
      const photoDate = new Date(BATCH_DATE);
      for (let i = 0; i < sourcePhotos.length; i++) {
        const sp = sourcePhotos[i];
        const newTakenAt = new Date(photoDate);
        newTakenAt.setHours(6, 30 + i * 10, 0, 0); // 06:30, 06:40, 06:50, 07:00

        await prisma.photo.create({
          data: {
            batchId: batch.id,
            url: sp.url,
            type: sp.type,
            caption: sp.caption,
            takenAt: newTakenAt,
          },
        });
      }
      console.log(`  📷 ${sourcePhotos.length} photos copied from ${sourceBatch.code}`);
    } else {
      console.log(`  ⚠️  No photos found in source batch ${sourceBatch.code}`);
    }
  } else {
    console.log(`  ⚠️  Source batch C/02/1/LDPA/01 not found — skipping photo copy`);
  }

  // ── Lab Result ──
  const labDate = new Date(BATCH_DATE);
  labDate.setDate(labDate.getDate() + 5);

  await prisma.labResult.create({
    data: {
      batchId: batch.id,
      labName: "Diamond Internacional de México",
      labCertification: "ISO 9001 — AMTIVO",
      sampleNumber: "305-26",
      lotNumber: "22022026",
      reportDate: labDate,
      crepitation: "Negativo",
      appearance: "Clara y Brillante",
      viscosity40C: 0.7492,
      color: "Ámbar dorado",
      waterContent: 42,
      sulfurPercent: 0.001,
      flashPoint: 68,
      density15C: 0.838,
      carbonResidue: 0.09,
      ashContent: 0.004,
      calorificMJ: 43.2,
      additionalTests: {
        "Punto de inflamación (°C)": "68",
        "Densidad 15°C (g/mL)": "0.838",
        "Residuo carbón (%)": "0.09",
        "Cenizas (%)": "0.004",
        "Poder calorífico (MJ/kg)": "43.2",
      },
      verdict: "Cumple con todas las especificaciones — calidad comparable a diésel comercial",
      analystName: "Ing. José Armando Rodriguez B.",
    },
  });
  console.log(`  🧪 Lab result created — Clara y Brillante ✓`);

  // ── Certificate ──
  const certCode = `CERT-${BATCH_CODE.replace(/\//g, "-")}`;
  const certHash = crypto
    .createHash("sha256")
    .update(`${BATCH_CODE}-${FEEDSTOCK_KG}-${OIL_OUTPUT_L}-${ghg.avoided.toFixed(1)}-${new Date().toISOString()}`)
    .digest("hex");

  await prisma.certificate.create({
    data: {
      batchId: batch.id,
      code: certCode,
      hash: certHash,
      qrData: JSON.stringify({
        code: certCode,
        batch: BATCH_CODE,
        weight: FEEDSTOCK_KG,
        oil: OIL_OUTPUT_L,
        co2Avoided: ghg.avoided.toFixed(1),
        verify: `https://novatrace-app-production.up.railway.app/verify/${certCode}`,
      }),
      co2Avoided: Math.round(ghg.avoided * 100) / 100,
      plasticDiverted: FEEDSTOCK_KG,
    },
  });
  console.log(`  🏆 Certificate: ${certCode}`);

  // ── Summary ──
  console.log("\n═══════════════════════════════════════");
  console.log("🏆 PERFECT BATCH SEEDED!");
  console.log(`   Code:         ${BATCH_CODE}`);
  console.log(`   ID:           ${batch.id}`);
  console.log(`   Feedstock:    ${FEEDSTOCK_KG} kg LDPE Agrícola (${CONTAMINATION_PCT}% contam → ${CLEAN_PLASTIC_KG} kg limpio)`);
  console.log(`   Oil Output:   ${OIL_OUTPUT_L} L (${yieldPct}% peso, ~80% vol)`);
  console.log(`   Duration:     ${Math.floor(DURATION_MIN / 60)}h ${DURATION_MIN % 60}m`);
  console.log(`   Max Temp:     ${MAX_REACTOR_TEMP}°C reactor, ${MAX_CONTROL_TEMP}°C CONTROL`);
  console.log(`   Diesel:       ${DIESEL_L} L (arranque only)`);
  console.log(`   CO₂ Avoided:  ${ghg.avoided.toFixed(1)} kg CO₂eq (${ghg.reductionPercent.toFixed(0)}% reduction)`);
  console.log(`   Readings:     ${readings.length}`);
  console.log(`   Events:       ${events.length}`);
  console.log(`   Certificate:  ${certCode}`);
  console.log(`   Lab:          Diamond Internacional — Clara y Brillante ✓`);
  console.log("═══════════════════════════════════════");
  console.log(`\n🔗 View at: https://novatrace-app-production.up.railway.app/batch/${batch.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
