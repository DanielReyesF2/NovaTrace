import { prisma } from "@/lib/prisma";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function HomePage() {
  const [batches, stats, recentEvents] = await Promise.all([
    prisma.batch.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        code: true,
        date: true,
        status: true,
        feedstockType: true,
        feedstockOrigin: true,
        feedstockWeight: true,
        oilOutput: true,
        yieldPercent: true,
        co2Avoided: true,
        co2Baseline: true,
        co2Project: true,
        maxReactorTemp: true,
        durationMinutes: true,
        stopReason: true,
        operators: true,
        labResults: { select: { id: true, labName: true, verdict: true } },
        certificates: { select: { id: true, code: true } },
        _count: { select: { readings: true, events: true, photos: true } },
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
    // Recent process events across all batches
    prisma.processEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: 8,
      select: {
        id: true,
        timestamp: true,
        type: true,
        detail: true,
        batch: { select: { code: true, id: true } },
      },
    }),
  ]);

  const completedCount = await prisma.batch.count({
    where: { status: "COMPLETED" },
  });

  return (
    <Dashboard
      batches={JSON.parse(JSON.stringify(batches))}
      recentEvents={JSON.parse(JSON.stringify(recentEvents))}
      lastBatchId={batches.length > 0 ? batches[0].id : null}
      stats={{
        totalBatches: stats._count,
        completedBatches: completedCount,
        totalFeedstockKg: stats._sum.feedstockWeight ?? 0,
        totalOilLiters: stats._sum.oilOutput ?? 0,
        totalCO2Avoided: stats._sum.co2Avoided ?? 0,
        totalCO2Baseline: stats._sum.co2Baseline ?? 0,
      }}
    />
  );
}
