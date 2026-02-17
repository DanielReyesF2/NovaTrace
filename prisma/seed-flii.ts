import { PrismaClient } from "@prisma/client";
import { calculateGHG } from "../src/lib/ghg";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// ============================================
// BATCH DEFINITIONS — ECO-003 through ECO-014
// Narrative: EcoNova learning curve & scaling
// ============================================
interface BatchDef {
  code: string;
  date: string;
  feedstockType: string;
  feedstockOrigin: string;
  feedstockWeight: number;
  status: "COMPLETED" | "INCOMPLETE";
  yieldPercent: number | null;
  oilOutput: number;
  contaminationPct: number;
  durationMinutes: number;
  maxReactorTemp: number;
  stopReason: string | null;
  notes: string;
  dieselConsumedL: number;
  operators: string[];
}

// Code format: {Year}/{Month}/{Reactor}/{Feedstock}/{Consecutive}
// Year: A=2024, B=2025. Reactor: 1=DY-500
// Feedstock: LDPA, HDPI, LDPF, PPM
const BATCHES: BatchDef[] = [
  {
    code: "A/10/1/LDPA/01",
    date: "2024-10-15",
    feedstockType: "LDPE Agrícola",
    feedstockOrigin: "Michoacán, MX",
    feedstockWeight: 60,
    status: "COMPLETED",
    yieldPercent: 10,
    oilOutput: 6,
    contaminationPct: 30,
    durationMinutes: 480,
    maxReactorTemp: 420,
    stopReason: "Completado",
    notes: "Primeras pruebas con lotes chicos. Parámetros conservadores.",
    dieselConsumedL: 2,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "A/10/1/LDPA/02",
    date: "2024-10-28",
    feedstockType: "LDPE Agrícola",
    feedstockOrigin: "Michoacán, MX",
    feedstockWeight: 80,
    status: "COMPLETED",
    yieldPercent: 12,
    oilOutput: 9.6,
    contaminationPct: 28,
    durationMinutes: 460,
    maxReactorTemp: 440,
    stopReason: "Completado",
    notes: "Mejora leve en yield, mismo material de origen.",
    dieselConsumedL: 2.2,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "A/11/1/HDPI/01",
    date: "2024-11-10",
    feedstockType: "HDPE Industrial",
    feedstockOrigin: "Jalisco, MX",
    feedstockWeight: 100,
    status: "COMPLETED",
    yieldPercent: 18,
    oilOutput: 18,
    contaminationPct: 20,
    durationMinutes: 420,
    maxReactorTemp: 460,
    stopReason: "Completado",
    notes: "Primer feedstock industrial. Mucho más limpio, buen yield.",
    dieselConsumedL: 2.5,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "A/11/1/LDPF/01",
    date: "2024-11-21",
    feedstockType: "LDPE Film",
    feedstockOrigin: "Edo. México, MX",
    feedstockWeight: 120,
    status: "INCOMPLETE",
    yieldPercent: null,
    oilOutput: 0,
    contaminationPct: 25,
    durationMinutes: 180,
    maxReactorTemp: 380,
    stopReason: "Bloqueo en condensador",
    notes: "Bloqueo en condensador por exceso de ceras. Lote detenido para revisión.",
    dieselConsumedL: 1.5,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "A/12/1/LDPA/01",
    date: "2024-12-05",
    feedstockType: "LDPE Agrícola",
    feedstockOrigin: "Puebla, MX",
    feedstockWeight: 150,
    status: "COMPLETED",
    yieldPercent: 22,
    oilOutput: 33,
    contaminationPct: 20,
    durationMinutes: 400,
    maxReactorTemp: 470,
    stopReason: "Completado",
    notes: "Post-aprendizaje del bloqueo. Yield sube significativamente.",
    dieselConsumedL: 2.8,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "A/12/1/HDPI/01",
    date: "2024-12-12",
    feedstockType: "HDPE Industrial",
    feedstockOrigin: "Jalisco, MX",
    feedstockWeight: 180,
    status: "COMPLETED",
    yieldPercent: 28,
    oilOutput: 50.4,
    contaminationPct: 15,
    durationMinutes: 380,
    maxReactorTemp: 480,
    stopReason: "Completado",
    notes: "Optimización de parámetros térmicos. Control mejorado.",
    dieselConsumedL: 3,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "A/12/1/PPM/01",
    date: "2024-12-20",
    feedstockType: "PP Mixto",
    feedstockOrigin: "Guanajuato, MX",
    feedstockWeight: 200,
    status: "COMPLETED",
    yieldPercent: 32,
    oilOutput: 64,
    contaminationPct: 15,
    durationMinutes: 360,
    maxReactorTemp: 490,
    stopReason: "Completado",
    notes: "Primer lote >200kg con yield >30%. Hito operativo.",
    dieselConsumedL: 3.2,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "B/01/1/LDPA/01",
    date: "2025-01-08",
    feedstockType: "LDPE Agrícola",
    feedstockOrigin: "Michoacán, MX",
    feedstockWeight: 250,
    status: "COMPLETED",
    yieldPercent: 38,
    oilOutput: 95,
    contaminationPct: 12,
    durationMinutes: 340,
    maxReactorTemp: 495,
    stopReason: "Completado",
    notes: "Escalamiento a 250kg. Proceso estable, parámetros optimizados.",
    dieselConsumedL: 3.5,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "B/01/1/LDPF/01",
    date: "2025-01-15",
    feedstockType: "LDPE Film",
    feedstockOrigin: "Edo. México, MX",
    feedstockWeight: 300,
    status: "COMPLETED",
    yieldPercent: 45,
    oilOutput: 135,
    contaminationPct: 10,
    durationMinutes: 320,
    maxReactorTemp: 500,
    stopReason: "Completado",
    notes: "Salto en eficiencia. Feedstock limpio pre-clasificado.",
    dieselConsumedL: 3.8,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "B/01/1/HDPI/01",
    date: "2025-01-25",
    feedstockType: "HDPE Industrial",
    feedstockOrigin: "Puebla, MX",
    feedstockWeight: 350,
    status: "COMPLETED",
    yieldPercent: 52,
    oilOutput: 182,
    contaminationPct: 10,
    durationMinutes: 310,
    maxReactorTemp: 505,
    stopReason: "Completado",
    notes: ">50% yield por primera vez. Proceso maduro.",
    dieselConsumedL: 4,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "B/02/1/LDPA/01",
    date: "2025-02-05",
    feedstockType: "LDPE Agrícola",
    feedstockOrigin: "Jalisco, MX",
    feedstockWeight: 400,
    status: "COMPLETED",
    yieldPercent: 55,
    oilOutput: 220,
    contaminationPct: 10,
    durationMinutes: 300,
    maxReactorTemp: 510,
    stopReason: "Completado",
    notes: "Consistencia en alta eficiencia. Escalamiento continuo.",
    dieselConsumedL: 4.2,
    operators: ["Daniel", "Salvador"],
  },
  {
    code: "B/02/1/PPM/01",
    date: "2025-02-10",
    feedstockType: "PP Mixto",
    feedstockOrigin: "Michoacán, MX",
    feedstockWeight: 450,
    status: "COMPLETED",
    yieldPercent: 60,
    oilOutput: 270,
    contaminationPct: 8,
    durationMinutes: 300,
    maxReactorTemp: 515,
    stopReason: "Completado",
    notes: "Récord: mayor lote + mayor yield. Dominio del proceso.",
    dieselConsumedL: 4.5,
    operators: ["Daniel", "Salvador"],
  },
];

// ============================================
// THERMAL READING GENERATOR
// ============================================
function generateReadings(
  baseDate: Date,
  durationMin: number,
  maxTemp: number,
  isIncomplete: boolean
) {
  const readings: Array<{
    timestamp: Date;
    reactorTemp: number;
    controlTemp: number;
    steelTemp: number;
    chainTemp: number;
  }> = [];

  const intervalMin = 5;
  const totalReadings = Math.floor(durationMin / intervalMin) + 1;
  const startHour = 8 + Math.floor(Math.random() * 3); // 8-10 AM

  for (let i = 0; i < totalReadings; i++) {
    const ts = new Date(baseDate);
    ts.setHours(startHour, i * intervalMin, 0, 0);

    const progress = i / (totalReadings - 1);

    // Realistic S-curve heating profile
    let reactorTemp: number;
    if (progress < 0.15) {
      // Ramp-up: ambient to ~200°C
      reactorTemp = 22 + (200 - 22) * (progress / 0.15);
    } else if (progress < 0.4) {
      // Transition: 200 to production zone
      const p = (progress - 0.15) / 0.25;
      reactorTemp = 200 + (maxTemp * 0.7 - 200) * p;
    } else if (isIncomplete && progress > 0.7) {
      // Incomplete: temperature drops or flatlines
      reactorTemp = maxTemp * 0.75 + Math.random() * 10 - 5;
    } else {
      // Production: gradually reaches max
      const p = (progress - 0.4) / 0.6;
      reactorTemp = maxTemp * 0.7 + (maxTemp - maxTemp * 0.7) * Math.min(p * 1.2, 1);
    }

    // Add realistic noise
    reactorTemp += (Math.random() - 0.5) * 8;
    reactorTemp = Math.round(reactorTemp * 10) / 10;

    // Derived temperatures
    const controlTemp = Math.round((reactorTemp * 0.45 + (Math.random() - 0.5) * 5) * 10) / 10;
    const steelTemp = Math.round((reactorTemp * 0.35 + 10 + (Math.random() - 0.5) * 4) * 10) / 10;
    const chainTemp = Math.round((reactorTemp * 0.3 + 5 + (Math.random() - 0.5) * 3) * 10) / 10;

    readings.push({
      timestamp: ts,
      reactorTemp: Math.max(22, reactorTemp),
      controlTemp: Math.max(22, controlTemp),
      steelTemp: Math.max(22, steelTemp),
      chainTemp: Math.max(22, chainTemp),
    });
  }

  return readings;
}

// ============================================
// PROCESS EVENT GENERATOR
// ============================================
function generateEvents(
  baseDate: Date,
  durationMin: number,
  isIncomplete: boolean,
  stopReason: string | null
) {
  const events: Array<{
    timestamp: Date;
    type: "PHASE_CHANGE" | "VALVE_CHANGE" | "EQUIPMENT_TOGGLE" | "FUEL_ADD" | "OBSERVATION" | "INCIDENT";
    detail: string;
    notes: string | null;
  }> = [];

  const startHour = 8 + Math.floor(Math.random() * 3);
  const makeTs = (offsetMin: number) => {
    const ts = new Date(baseDate);
    ts.setHours(startHour, offsetMin, 0, 0);
    return ts;
  };

  // Start
  events.push({
    timestamp: makeTs(0),
    type: "PHASE_CHANGE",
    detail: "Inicio de calentamiento — quemador de aceite ON",
    notes: null,
  });

  // Fuel add early
  events.push({
    timestamp: makeTs(15),
    type: "FUEL_ADD",
    detail: "Carga de diesel para quemador",
    notes: null,
  });

  // Phase change - production zone
  events.push({
    timestamp: makeTs(Math.floor(durationMin * 0.3)),
    type: "PHASE_CHANGE",
    detail: "Reactor entra en zona de producción (>200°C)",
    notes: null,
  });

  // Valve change
  events.push({
    timestamp: makeTs(Math.floor(durationMin * 0.35)),
    type: "VALVE_CHANGE",
    detail: "Válvula de condensador abierta — inicio recolección",
    notes: null,
  });

  if (isIncomplete) {
    events.push({
      timestamp: makeTs(Math.floor(durationMin * 0.7)),
      type: "INCIDENT",
      detail: stopReason || "Incidente detectado — proceso detenido",
      notes: "Batch detenido para revisión de equipo",
    });
    events.push({
      timestamp: makeTs(durationMin),
      type: "PHASE_CHANGE",
      detail: "Proceso finalizado — apagado de emergencia",
      notes: null,
    });
  } else {
    // Mid-process observation
    events.push({
      timestamp: makeTs(Math.floor(durationMin * 0.5)),
      type: "OBSERVATION",
      detail: "Flujo de aceite estable, color ámbar claro",
      notes: null,
    });

    // Equipment toggle
    events.push({
      timestamp: makeTs(Math.floor(durationMin * 0.6)),
      type: "EQUIPMENT_TOGGLE",
      detail: "Compresor de aire ajustado",
      notes: null,
    });

    // Additional fuel for longer batches
    if (durationMin > 350) {
      events.push({
        timestamp: makeTs(Math.floor(durationMin * 0.65)),
        type: "FUEL_ADD",
        detail: "Recarga de diesel para quemador",
        notes: null,
      });
    }

    // Completion
    events.push({
      timestamp: makeTs(durationMin),
      type: "PHASE_CHANGE",
      detail: "Proceso completado — apagado controlado",
      notes: null,
    });
  }

  return events;
}

// ============================================
// LAB RESULT TEMPLATES
// ============================================
const LAB_NAMES = [
  "Diamond Internacional de México",
  "Laboratorio SGS México",
  "Intertek Testing Services",
];

function generateLabResult(batchIndex: number, batchId: string, reportDate: Date) {
  // Progress from early batches (lower quality) to later ones (higher quality)
  const progress = batchIndex / 11; // 0..1

  return {
    batchId,
    labName: LAB_NAMES[batchIndex % LAB_NAMES.length],
    labCertification: "ISO 9001 — AMTIVO",
    sampleNumber: `${295 + batchIndex}-${26 + batchIndex}`,
    lotNumber: `${12 + batchIndex}022026`,
    reportDate,
    crepitation: "Negativo",
    appearance: progress > 0.5 ? "Clara y Brillante" : "Ligeramente turbia",
    viscosity40C: Math.round((1.2 - progress * 0.5 + (Math.random() - 0.5) * 0.1) * 10000) / 10000,
    color: progress > 0.6 ? "Ámbar claro" : "Café",
    waterContent: Math.round(120 - progress * 80 + (Math.random() - 0.5) * 10),
    sulfurPercent: Math.round((0.01 - progress * 0.008 + (Math.random() - 0.5) * 0.001) * 10000) / 10000,
    verdict: "Cumple con las especificaciones",
    analystName: "Ing. José Armando Rodriguez B.",
  };
}

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function main() {
  console.log("🌱 Seeding FLII demo data (12 new batches)...\n");

  const labBatchIndices = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11]; // All completed
  const certBatchIndices = [4, 7, 8, 9, 10, 11]; // Mature batches

  for (let i = 0; i < BATCHES.length; i++) {
    const def = BATCHES[i];
    const batchDate = new Date(def.date);

    // Calculate GHG
    let ghgResult = null;
    if (def.status === "COMPLETED" && def.oilOutput > 0) {
      ghgResult = calculateGHG({
        feedstockKg: def.feedstockWeight,
        contaminationPct: def.contaminationPct,
        oilLiters: def.oilOutput,
        dieselConsumedL: def.dieselConsumedL,
        durationHours: def.durationMinutes / 60,
      });
    }

    // Upsert batch
    const batch = await prisma.batch.upsert({
      where: { code: def.code },
      update: {
        date: batchDate,
        status: def.status,
        feedstockType: def.feedstockType,
        feedstockOrigin: def.feedstockOrigin,
        feedstockWeight: def.feedstockWeight,
        feedstockCondition:
          def.contaminationPct > 20
            ? "Sin triturar, con tierra y residuos"
            : def.contaminationPct > 15
            ? "Parcialmente limpio, algo de tierra"
            : "Pre-clasificado, limpio",
        contaminationPct: def.contaminationPct,
        oilOutput: def.oilOutput,
        oilWeightKg: def.oilOutput > 0 ? Math.round(def.oilOutput * 0.85 * 100) / 100 : null,
        yieldPercent: def.yieldPercent,
        startTime: (() => {
          const st = new Date(batchDate);
          st.setHours(9, 0, 0, 0);
          return st;
        })(),
        endTime: (() => {
          const et = new Date(batchDate);
          et.setHours(9 + Math.floor(def.durationMinutes / 60), def.durationMinutes % 60, 0, 0);
          return et;
        })(),
        durationMinutes: def.durationMinutes,
        maxReactorTemp: def.maxReactorTemp,
        dieselConsumedL: def.dieselConsumedL,
        stopReason: def.stopReason,
        notes: def.notes,
        operators: def.operators,
        co2Baseline: ghgResult?.baselineTotal ?? null,
        co2Project: ghgResult?.projectTotal ?? null,
        co2Avoided: ghgResult?.avoided ?? null,
      },
      create: {
        code: def.code,
        date: batchDate,
        status: def.status,
        feedstockType: def.feedstockType,
        feedstockOrigin: def.feedstockOrigin,
        feedstockWeight: def.feedstockWeight,
        feedstockCondition:
          def.contaminationPct > 20
            ? "Sin triturar, con tierra y residuos"
            : def.contaminationPct > 15
            ? "Parcialmente limpio, algo de tierra"
            : "Pre-clasificado, limpio",
        contaminationPct: def.contaminationPct,
        oilOutput: def.oilOutput,
        oilWeightKg: def.oilOutput > 0 ? Math.round(def.oilOutput * 0.85 * 100) / 100 : null,
        yieldPercent: def.yieldPercent,
        startTime: (() => {
          const st = new Date(batchDate);
          st.setHours(9, 0, 0, 0);
          return st;
        })(),
        endTime: (() => {
          const et = new Date(batchDate);
          et.setHours(9 + Math.floor(def.durationMinutes / 60), def.durationMinutes % 60, 0, 0);
          return et;
        })(),
        durationMinutes: def.durationMinutes,
        maxReactorTemp: def.maxReactorTemp,
        dieselConsumedL: def.dieselConsumedL,
        stopReason: def.stopReason,
        notes: def.notes,
        operators: def.operators,
        co2Baseline: ghgResult?.baselineTotal ?? null,
        co2Project: ghgResult?.projectTotal ?? null,
        co2Avoided: ghgResult?.avoided ?? null,
      },
    });

    console.log(
      `  ✅ ${def.code} — ${def.feedstockWeight}kg ${def.feedstockType} → ${def.oilOutput}L (${def.yieldPercent ?? "—"}%) [${def.status}]`
    );

    // Delete old readings/events for this batch (idempotent)
    await prisma.reading.deleteMany({ where: { batchId: batch.id } });
    await prisma.processEvent.deleteMany({ where: { batchId: batch.id } });

    // Generate thermal readings
    const readings = generateReadings(
      batchDate,
      def.durationMinutes,
      def.maxReactorTemp,
      def.status === "INCOMPLETE"
    );
    await prisma.reading.createMany({
      data: readings.map((r) => ({
        batchId: batch.id,
        ...r,
      })),
    });
    console.log(`     📈 ${readings.length} thermal readings`);

    // Generate process events
    const events = generateEvents(
      batchDate,
      def.durationMinutes,
      def.status === "INCOMPLETE",
      def.stopReason
    );
    await prisma.processEvent.createMany({
      data: events.map((e) => ({
        batchId: batch.id,
        ...e,
      })),
    });
    console.log(`     📋 ${events.length} process events`);

    // Lab results (for completed batches)
    if (labBatchIndices.includes(i) && def.status === "COMPLETED") {
      const labDate = new Date(batchDate);
      labDate.setDate(labDate.getDate() + 5);

      const existingLab = await prisma.labResult.findFirst({
        where: { batchId: batch.id },
      });

      if (!existingLab) {
        await prisma.labResult.create({
          data: generateLabResult(i, batch.id, labDate),
        });
        console.log(`     🧪 Lab result created`);
      }
    }

    // Certificates (for mature batches)
    if (certBatchIndices.includes(i) && def.status === "COMPLETED") {
      const existingCert = await prisma.certificate.findFirst({
        where: { batchId: batch.id },
      });

      if (!existingCert) {
        const certCode = `CERT-${def.code.replace(/\//g, "-")}`;
        const certHash = crypto
          .createHash("sha256")
          .update(`${def.code}-${def.feedstockWeight}-${def.oilOutput}-${ghgResult?.avoided ?? 0}`)
          .digest("hex");

        await prisma.certificate.create({
          data: {
            batchId: batch.id,
            code: certCode,
            hash: certHash,
            qrData: JSON.stringify({
              code: certCode,
              batch: def.code,
              weight: def.feedstockWeight,
              oil: def.oilOutput,
              co2Avoided: ghgResult?.avoided?.toFixed(1) ?? "0",
              verify: `https://novatrace.up.railway.app/verify/${certCode}`,
            }),
            co2Avoided: ghgResult?.avoided ?? 0,
            plasticDiverted: def.feedstockWeight,
          },
        });
        console.log(`     🏆 Certificate ${certCode}`);
      }
    }

    console.log("");
  }

  // Summary
  const totalBatches = await prisma.batch.count();
  const totalCompleted = await prisma.batch.count({ where: { status: "COMPLETED" } });
  const totalReadings = await prisma.reading.count();
  const totalEvents = await prisma.processEvent.count();
  const totalLabs = await prisma.labResult.count();
  const totalCerts = await prisma.certificate.count();
  const agg = await prisma.batch.aggregate({
    _sum: { feedstockWeight: true, oilOutput: true, co2Avoided: true },
  });

  console.log("═══════════════════════════════════════");
  console.log("🌱 FLII Seed Complete!");
  console.log(`   Batches:     ${totalBatches} (${totalCompleted} completed)`);
  console.log(`   Readings:    ${totalReadings}`);
  console.log(`   Events:      ${totalEvents}`);
  console.log(`   Lab Results: ${totalLabs}`);
  console.log(`   Certificates:${totalCerts}`);
  console.log(`   Total Feed:  ${agg._sum.feedstockWeight} kg`);
  console.log(`   Total Oil:   ${agg._sum.oilOutput} L`);
  console.log(`   CO₂ Avoided: ${agg._sum.co2Avoided?.toFixed(1)} kg`);
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
