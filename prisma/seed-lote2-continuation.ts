/**
 * Seed: Lote 2 Continuation Data
 *
 * Batch ECO-DY500-20250212-001 had a blockage (tapón) at 4:20 PM.
 * After a ~50 min pause, the process resumed at 5:10 PM.
 * This script inserts the continuation readings from the paper logbook.
 *
 * Run: npx tsx prisma/seed-lote2-continuation.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BATCH_ID = "cmllaoika0003xp3yrqnsp6sx";

// Helper: Mexico time (UTC-6) to UTC ISO string
function mxToUTC(date: string, time: string): string {
  // date format: "2025-02-12", time format: "17:10"
  const [h, m] = time.split(":").map(Number);
  const utcH = h + 6; // UTC-6 → UTC
  const day = parseInt(date.split("-")[2]);
  const month = date.split("-")[1];
  const year = date.split("-")[0];

  if (utcH >= 24) {
    // Rolls over to next day
    const nextDay = day + 1;
    const paddedDay = String(nextDay).padStart(2, "0");
    const paddedH = String(utcH - 24).padStart(2, "0");
    const paddedM = String(m).padStart(2, "0");
    return `${year}-${month}-${paddedDay}T${paddedH}:${paddedM}:00.000Z`;
  }

  const paddedDay = String(day).padStart(2, "0");
  const paddedH = String(utcH).padStart(2, "0");
  const paddedM = String(m).padStart(2, "0");
  return `${year}-${month}-${paddedDay}T${paddedH}:${paddedM}:00.000Z`;
}

// Readings from paper logbook — continuation after blockage pause
// Columns: [timeMX, controlTemp, reactorTemp, steelTemp, chainTemp, regulatorPsi]
const readings: [string, number, number, number, number, number | null][] = [
  ["17:10", 5.2, 303.1, 174.2, 121.3, 0],
  ["17:25", 5.1, 292.4, 174.7, 128.7, 30],
  ["17:30", 49, 284, 172.6, 186, 30], // Corrected: paper read as 28.4/18.6
  ["17:35", 48, 277.8, 172.3, 128.7, 30],
  ["17:40", 47, 271.8, 165, 112.7, 30],
  ["17:45", 47, 270.7, 165.1, 114.7, null],
  ["17:50", 46, 264.1, 156.0, 114.7, null],
  ["17:55", 46, 235.1, 156.0, 111.2, null],
  ["18:00", 45, 250.2, 147.3, 106.0, null],
  ["18:05", 45, 249.3, 144.3, 106.0, null],
  ["18:10", 44, 234.3, 141.4, 101.9, null],
  ["18:15", 44, 253.3, 139.7, 103.1, null],
  ["18:20", 43, 215.4, 136.4, 106.8, null],
  ["18:25", 43, 210.7, 134.3, 98.0, null],
  ["18:30", 43, 206.3, 132.0, 98.4, null],
  ["18:35", 43, 201.7, 130.1, 95.5, null],
];

// NOTE: Original batch readings use 2025-02-11 as the base date in UTC.
// The batch was on Feb 12 MX time, but original seed stored times as UTC
// starting from Feb 11 18:45 (= 12:45 PM MX on Feb 12).
// Continuation at 5:10 PM MX = 23:10 UTC = Feb 11 23:10 UTC.
const DATE = "2025-02-11";

async function main() {
  // Verify batch exists
  const batch = await prisma.batch.findUnique({ where: { id: BATCH_ID } });
  if (!batch) {
    console.error(`❌ Batch ${BATCH_ID} not found`);
    process.exit(1);
  }
  console.log(`✅ Found batch: ${batch.code} (${batch.status})`);

  // Check existing readings count
  const existingCount = await prisma.reading.count({
    where: { batchId: BATCH_ID },
  });
  console.log(`📊 Existing readings: ${existingCount}`);

  // Insert readings
  const readingData = readings.map(
    ([time, controlTemp, reactorTemp, steelTemp, chainTemp, regulatorPsi]) => ({
      batchId: BATCH_ID,
      timestamp: new Date(mxToUTC(DATE, time)),
      controlTemp,
      reactorTemp,
      steelTemp,
      chainTemp,
      regulatorPsi,
    })
  );

  const created = await prisma.reading.createMany({
    data: readingData,
  });
  console.log(`✅ Inserted ${created.count} readings`);

  // Insert process events
  await prisma.processEvent.create({
    data: {
      batchId: BATCH_ID,
      timestamp: new Date(mxToUTC(DATE, "17:10")),
      type: "PHASE_CHANGE",
      detail:
        "Reanudación de proceso — tapón en condensación resuelto, pausa de ~50 min",
      notes: "Continuación después de pausa por bloqueo en sistema de condensación",
    },
  });
  console.log(`✅ Event: PHASE_CHANGE (reanudación) at 17:10 MX`);

  await prisma.processEvent.create({
    data: {
      batchId: BATCH_ID,
      timestamp: new Date(mxToUTC(DATE, "18:35")),
      type: "OBSERVATION",
      detail:
        "Fin de lecturas de continuación — reactor en descenso (201.7°C)",
      notes: "Última lectura registrada en bitácora de continuación",
    },
  });
  console.log(`✅ Event: OBSERVATION (fin lecturas) at 18:35 MX`);

  // Update batch notes
  await prisma.batch.update({
    where: { id: BATCH_ID },
    data: {
      notes: `${batch.notes || ""}\n\nContinuación (12 Feb 5:10-6:35 PM): Después de ~50 min de pausa por tapón en condensación, se reanudó el monitoreo. Reactor descendió de 303°C a 201°C. 16 lecturas adicionales registradas desde bitácora en papel.`.trim(),
    },
  });
  console.log(`✅ Updated batch notes`);

  // Final count
  const finalCount = await prisma.reading.count({
    where: { batchId: BATCH_ID },
  });
  console.log(`\n📊 Total readings now: ${finalCount} (was ${existingCount})`);
  console.log(`🎉 Done!`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
