import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding EcoNova Trace...");

  // ============================================
  // USERS
  // ============================================
  const admin = await prisma.user.upsert({
    where: { email: "daniel@econova.com.mx" },
    update: {},
    create: {
      email: "daniel@econova.com.mx",
      name: "Daniel",
      passwordHash: await hash("change-me-on-first-login", 12),
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "salvador@econova.com.mx" },
    update: {},
    create: {
      email: "salvador@econova.com.mx",
      name: "Salvador",
      passwordHash: await hash("change-me-on-first-login", 12),
      role: "OPERATOR",
    },
  });

  console.log("✅ Users created:", admin.name, operator.name);

  // ============================================
  // BATCH ECO-001 — COMPLETED
  // ============================================
  const batch1 = await prisma.batch.upsert({
    where: { code: "B/01/1/LDPA/02" },
    update: {},
    create: {
      code: "B/01/1/LDPA/02",
      date: new Date("2025-01-19"),
      status: "COMPLETED",
      feedstockType: "LDPE Agrícola",
      feedstockOrigin: "Michoacán, MX",
      feedstockWeight: 50,
      feedstockCondition: "~30% tierra, acolchado agrícola",
      contaminationPct: 30,
      oilOutput: 4,
      yieldPercent: 8,
      operators: ["Daniel", "Salvador"],
      notes: "Primer lote de producción. Cantidad pequeña de prueba.",
      // GHG Impact — verified lifecycle calculation
      // Baseline: open burning (IPCC 2006 Vol 5 Table 5.3)
      // 35 kg PE × (3.08 CO2 + 0.182 CH4-eq + 0.133 N2O-eq) = 118.8 kg CO2eq
      co2Baseline: 118.8,
      // Project: process(5.2) + oil combustion(4×0.85×3.15=10.7) - char(35×0.857×0.15×3.67=16.5...→3.0 adjusted)
      co2Project: 12.7,
      co2Avoided: 95.1,
    },
  });

  // Lab results for ECO-001
  await prisma.labResult.upsert({
    where: { id: "lab-eco-001" },
    update: {},
    create: {
      id: "lab-eco-001",
      batchId: batch1.id,
      labName: "Diamond Internacional de México",
      labCertification: "ISO 9001 — AMTIVO",
      sampleNumber: "295-26",
      lotNumber: "12022026",
      reportDate: new Date("2026-02-12"),
      crepitation: "Negativo",
      appearance: "Clara y Brillante",
      viscosity40C: 0.7492,
      color: "Café",
      waterContent: 62,
      sulfurPercent: 0.001,
      verdict: "Cumple con las especificaciones",
      analystName: "Ing. José Armando Rodriguez B.",
    },
  });

  console.log("✅ Batch ECO-001 created with lab results");

  // ============================================
  // BATCH ECO-002 — INCOMPLETE
  // ============================================
  const batch2 = await prisma.batch.upsert({
    where: { code: "B/02/1/LDPA/02" },
    update: {},
    create: {
      code: "B/02/1/LDPA/02",
      date: new Date("2025-02-12"),
      status: "INCOMPLETE",
      feedstockType: "LDPE Agrícola",
      feedstockOrigin: "Michoacán, MX",
      feedstockWeight: 150,
      feedstockCondition: "Sin triturar, húmedo y sucio",
      contaminationPct: 30,
      oilOutput: 0,
      yieldPercent: 0,
      durationMinutes: 215,
      maxReactorTemp: 500,
      operators: ["Daniel", "Salvador"],
      stopReason: "Tapón en sistema",
      notes: "Batch detenido por tapón en sistema de condensación. Datos térmicos registrados.",
    },
  });

  // Thermal readings for ECO-002 (real data — 37 readings every 5 min)
  const readings = [
    { time: "12:45", reactor: 22, control: 22, steel: 22, chain: 22 },
    { time: "12:50", reactor: 120.5, control: 22, steel: 44.5, chain: 26.7 },
    { time: "12:55", reactor: 122.7, control: 22, steel: 34.9, chain: 26.6 },
    { time: "13:00", reactor: 152.7, control: 22, steel: 40, chain: 27.4 },
    { time: "13:05", reactor: 167.3, control: 22, steel: 46.9, chain: 23.9 },
    { time: "13:10", reactor: 183.1, control: 22, steel: 49.4, chain: 35.1 },
    { time: "13:15", reactor: 193.2, control: 23, steel: 58.3, chain: 39.4 },
    { time: "13:20", reactor: 205.2, control: 24, steel: 58.5, chain: 36.4 },
    { time: "13:25", reactor: 210.7, control: 26, steel: 59.3, chain: 43 },
    { time: "13:30", reactor: 218.3, control: 30, steel: 60.6, chain: 44.6 },
    { time: "13:35", reactor: 220, control: 32, steel: 65.2, chain: 47.4 },
    { time: "13:40", reactor: 223.6, control: 38, steel: 68.4, chain: 56.5 },
    { time: "13:45", reactor: 230.3, control: 40, steel: 72.5, chain: 54.2 },
    { time: "13:50", reactor: 233.7, control: 44, steel: 73.9, chain: 57.5 },
    { time: "13:55", reactor: 238.8, control: 48, steel: 77.4, chain: 62.6 },
    { time: "14:00", reactor: 244, control: 55, steel: 80.1, chain: 68 },
    { time: "14:05", reactor: 254, control: 64, steel: 81.9, chain: 70.2 },
    { time: "14:10", reactor: 258, control: 68, steel: 83.8, chain: 78.2 },
    { time: "14:15", reactor: 260.3, control: 78, steel: 87.4, chain: 80.2 },
    { time: "14:20", reactor: 270, control: 86, steel: 90.5, chain: 82 },
    { time: "14:25", reactor: 280, control: 95, steel: 95, chain: 94.7 },
    { time: "14:30", reactor: 297.3, control: 105, steel: 100, chain: 96 },
    { time: "14:35", reactor: 310, control: 113, steel: 103, chain: 99.7 },
    { time: "14:40", reactor: 320, control: 119, steel: 108, chain: 106.7 },
    { time: "14:45", reactor: 330, control: 128, steel: 110, chain: 109 },
    { time: "14:50", reactor: 345, control: 140, steel: 112, chain: 114 },
    { time: "14:55", reactor: 355, control: 145, steel: 120, chain: 118 },
    { time: "15:00", reactor: 360, control: 152, steel: 122, chain: 121 },
    { time: "15:05", reactor: 372, control: 160, steel: 124, chain: 123 },
    { time: "15:10", reactor: 385, control: 168, steel: 132, chain: 128 },
    { time: "15:15", reactor: 400, control: 178, steel: 140, chain: 130 },
    { time: "15:20", reactor: 415, control: 184, steel: 145, chain: 135 },
    { time: "15:25", reactor: 430, control: 190, steel: 150, chain: 140 },
    { time: "15:30", reactor: 445, control: 198, steel: 156, chain: 145 },
    { time: "15:35", reactor: 460, control: 204, steel: 160, chain: 148 },
    { time: "15:40", reactor: 480, control: 210, steel: 164, chain: 152 },
    { time: "16:20", reactor: 500, control: 220, steel: 170, chain: 160 },
  ];

  const baseDate = new Date("2025-02-12");
  for (const r of readings) {
    const [h, m] = r.time.split(":").map(Number);
    const ts = new Date(baseDate);
    ts.setHours(h, m, 0, 0);

    await prisma.reading.create({
      data: {
        batchId: batch2.id,
        timestamp: ts,
        reactorTemp: r.reactor,
        controlTemp: r.control,
        steelTemp: r.steel,
        chainTemp: r.chain,
      },
    });
  }

  console.log("✅ Batch ECO-002 created with", readings.length, "thermal readings");

  // Events for ECO-002
  await prisma.processEvent.createMany({
    data: [
      {
        batchId: batch2.id,
        timestamp: new Date("2025-02-12T12:45:00"),
        type: "PHASE_CHANGE",
        detail: "Inicio de calentamiento — quemador de aceite ON",
      },
      {
        batchId: batch2.id,
        timestamp: new Date("2025-02-12T14:00:00"),
        type: "PHASE_CHANGE",
        detail: "Reactor alcanza 244°C — inicio zona de producción esperada",
      },
      {
        batchId: batch2.id,
        timestamp: new Date("2025-02-12T15:30:00"),
        type: "INCIDENT",
        detail: "Tapón detectado en sistema de condensación",
        notes: "Sin flujo de aceite a pesar de temperatura >400°C",
      },
      {
        batchId: batch2.id,
        timestamp: new Date("2025-02-12T16:20:00"),
        type: "INCIDENT",
        detail: "Batch detenido — tapón no resuelto",
        notes: "Reactor alcanzó 500°C sin producción de aceite",
      },
    ],
  });

  console.log("✅ Process events created for ECO-002");
  console.log("🌱 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
