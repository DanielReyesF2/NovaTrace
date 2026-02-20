import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed: Lab results for Lote 1 — C/02/1/LDPA/01
 *
 * Lab 1: Diamond Internacional de México — muestra 295-26 (aceite pirolítico)
 * Lab 2: Folio M-1270 — 18/02/2026 (solvente)
 */

const LOTE1_CODE = "C/02/1/LDPA/01";

async function main() {
  const batch = await prisma.batch.findUnique({
    where: { code: LOTE1_CODE },
    select: { id: true, code: true },
  });

  if (!batch) {
    console.error(`❌ Batch ${LOTE1_CODE} not found`);
    return;
  }

  console.log(`🔬 Seeding lab results for ${batch.code} (${batch.id})`);

  // ── Lab 1: Diamond Internacional de México ──
  // Original results from the first lab analysis
  const lab1 = await prisma.labResult.create({
    data: {
      batchId: batch.id,
      labName: "Diamond Internacional de México",
      labCertification: "ISO 9001 — AMTIVO",
      sampleNumber: "295-26",
      lotNumber: "12022026",
      reportDate: new Date("2026-02-12"),
      productClassification: "Aceite pirolítico",

      // Test results
      crepitation: "Negativo",
      appearance: "Clara y Brillante",
      viscosity40C: 0.7492, // mm²/s — ASTM D7042
      color: "Café",
      waterContent: 133, // PPM — ASTM D6304
      sulfurPercent: 0.001, // % m/m — ASTM D4951
      flashPoint: 68, // °C — ASTM D93 (copa cerrada)
      density15C: 0.838, // g/mL — ASTM D4052
      carbonResidue: 0.09, // % — ASTM D4530
      ashContent: 0.004, // % — ASTM D482
      calorificMJ: 43.2, // MJ/kg

      verdict: "Cumple con las especificaciones — calidad comparable a diésel comercial",
      analystName: "Ing. José Armando Rodriguez B.",
    },
  });
  console.log(`  🧪 Lab 1 created: Diamond Internacional — ${lab1.id}`);

  // ── Lab 2: Folio M-1270 (segundo laboratorio) ──
  // Nota: "El producto es un solvente, no un aceite"
  // Punto de inflamación <5°C indica fracción ligera / nafta pirolítica
  const lab2 = await prisma.labResult.create({
    data: {
      batchId: batch.id,
      labName: "Laboratorio M-1270",
      sampleNumber: "M-1270",
      reportDate: new Date("2026-02-18"),
      productClassification: "Solvente",

      // Test results — métodos ASTM diferentes al Lab 1
      density20C: 0.77, // Kg/L — ASTM D1298
      viscDynamic20C: 6.3, // cP — ASTM D2983
      flashPointOpen: 5, // °C — ASTM D92 copa abierta (<5)
      calorificCalG: 10830, // Cal/g — ASTM D240
      waterSedimentPct: 0.2, // % — ASTM D4007
      waterByKFPct: 0.1399, // % — ASTM E203

      labNotes: "Olor fuerte. El producto es un solvente, no un aceite como lo indica en su etiqueta.",

      additionalTests: {
        "Densidad 20°C (Kg/L)": "0.77 — ASTM D1298",
        "Viscosidad Dinámica 20°C (cP)": "6.3 — ASTM D2983",
        "Punto de inflamación copa abierta (°C)": "<5 — ASTM D92",
        "Poder Calorífico (Cal/g)": "10830 — ASTM D240",
        "Agua y sedimento (%)": "0.2 — ASTM D4007",
        "Agua por KF (%)": "0.1399 — ASTM E203",
      },

      verdict: "Producto clasificado como solvente — fracción ligera de pirólisis",
    },
  });
  console.log(`  🧪 Lab 2 created: M-1270 (Solvente) — ${lab2.id}`);

  console.log(`\n✅ ${LOTE1_CODE} now has 2 lab results`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
