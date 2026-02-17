import { prisma } from "@/lib/prisma";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const [batches, aggregate, completedCount] = await Promise.all([
    prisma.batch.findMany({
      orderBy: { date: "asc" },
      select: {
        id: true,
        code: true,
        date: true,
        status: true,
        feedstockType: true,
        feedstockOrigin: true,
        feedstockWeight: true,
        contaminationPct: true,
        oilOutput: true,
        yieldPercent: true,
        durationMinutes: true,
        maxReactorTemp: true,
        dieselConsumedL: true,
        co2Baseline: true,
        co2Project: true,
        co2Avoided: true,
        stopReason: true,
        notes: true,
        labResults: {
          select: {
            viscosity40C: true,
            waterContent: true,
            sulfurPercent: true,
            verdict: true,
          },
        },
        certificates: { select: { id: true } },
        _count: { select: { readings: true, events: true } },
      },
    }),
    prisma.batch.aggregate({
      _sum: {
        feedstockWeight: true,
        oilOutput: true,
        co2Avoided: true,
        co2Baseline: true,
      },
      _count: true,
    }),
    prisma.batch.count({ where: { status: "COMPLETED" } }),
  ]);

  return (
    <AnalyticsDashboard
      batches={JSON.parse(JSON.stringify(batches))}
      summary={{
        totalBatches: aggregate._count,
        completedBatches: completedCount,
        totalFeedstockKg: aggregate._sum.feedstockWeight ?? 0,
        totalOilLiters: aggregate._sum.oilOutput ?? 0,
        totalCO2Avoided: aggregate._sum.co2Avoided ?? 0,
        totalCO2Baseline: aggregate._sum.co2Baseline ?? 0,
      }}
    />
  );
}
