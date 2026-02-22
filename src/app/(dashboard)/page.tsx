import { prisma } from "@/lib/prisma";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function HomePage() {
  const [batches, stats, completedCount, inProgressCount, equipment] =
    await Promise.all([
      // All batches (latest first)
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
          operators: true,
          labResults: { select: { id: true, labName: true, verdict: true } },
          certificates: { select: { id: true, code: true } },
        },
      }),

      // Aggregate stats
      prisma.batch.aggregate({
        _sum: {
          feedstockWeight: true,
          oilOutput: true,
          co2Avoided: true,
          co2Baseline: true,
        },
        _count: true,
      }),

      // Status counts
      prisma.batch.count({ where: { status: "COMPLETED" } }),
      prisma.batch.count({ where: { status: "ACTIVE" } }),

      // Top-level equipment for Digital Twin preview (no parents = main machines)
      prisma.equipment.findMany({
        where: { parentEquipmentId: null, isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          tag: true,
          type: true,
          calibrationStatus: true,
          calibrationExpiry: true,
          location: true,
          subsystem: true,
          specs: true,
          _count: { select: { childEquipment: true } },
        },
      }),
    ]);

  return (
    <Dashboard
      batches={JSON.parse(JSON.stringify(batches))}
      equipment={JSON.parse(JSON.stringify(equipment))}
      stats={{
        totalBatches: stats._count,
        completedBatches: completedCount,
        totalFeedstockKg: stats._sum.feedstockWeight ?? 0,
        totalOilLiters: stats._sum.oilOutput ?? 0,
        totalCO2Avoided: stats._sum.co2Avoided ?? 0,
        totalCO2Baseline: stats._sum.co2Baseline ?? 0,
        inProgressBatches: inProgressCount,
      }}
    />
  );
}
