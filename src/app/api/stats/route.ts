import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany();

    const stats = {
      totalBatches: batches.length,
      completedBatches: batches.filter((b) => b.status === "COMPLETED").length,
      activeBatches: batches.filter((b) => b.status === "ACTIVE").length,
      totalFeedstockKg: batches.reduce((sum, b) => sum + b.feedstockWeight, 0),
      totalOilLiters: batches.reduce((sum, b) => sum + (b.oilOutput ?? 0), 0),
      totalCO2Avoided: batches.reduce((sum, b) => sum + (b.co2Avoided ?? 0), 0),
      totalCO2Baseline: batches.reduce((sum, b) => sum + (b.co2Baseline ?? 0), 0),
      totalCO2Project: batches.reduce((sum, b) => sum + (b.co2Project ?? 0), 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
