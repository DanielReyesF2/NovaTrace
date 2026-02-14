import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBatchInsights } from "@/lib/nova-ai";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Fetch batch with all related data
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        readings: { orderBy: { timestamp: "asc" } },
        events: { orderBy: { timestamp: "asc" } },
        labResults: true,
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Fetch historical stats for comparison
    const [historicalAgg, batchCount, user] = await Promise.all([
      prisma.batch.aggregate({
        _avg: {
          yieldPercent: true,
          durationMinutes: true,
          co2Avoided: true,
        },
      }),
      prisma.batch.count(),
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true },
      }),
    ]);

    const historical = {
      avgYield: historicalAgg._avg.yieldPercent ?? 0,
      avgDuration: historicalAgg._avg.durationMinutes ?? 0,
      avgCO2Avoided: historicalAgg._avg.co2Avoided ?? 0,
      totalBatches: batchCount,
    };

    const userName = user?.name || session.email.split("@")[0];

    // Serialize dates for the analysis engine
    const batchData = JSON.parse(JSON.stringify(batch));

    const insights = await generateBatchInsights(
      batchData,
      historical,
      userName
    );

    if (!insights) {
      return NextResponse.json(
        { error: "Nova AI no pudo generar insights para este lote." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Insights API]", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Error interno al generar insights" },
      { status: 500 }
    );
  }
}
