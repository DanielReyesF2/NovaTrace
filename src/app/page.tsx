import { prisma } from "@/lib/prisma";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function HomePage() {
  const [batches, stats] = await Promise.all([
    prisma.batch.findMany({
      orderBy: { date: "desc" },
      include: {
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
      },
      _count: true,
    }),
  ]);

  const completedCount = await prisma.batch.count({
    where: { status: "COMPLETED" },
  });

  return (
    <Dashboard
      batches={JSON.parse(JSON.stringify(batches))}
      stats={{
        totalBatches: stats._count,
        completedBatches: completedCount,
        totalFeedstockKg: stats._sum.feedstockWeight ?? 0,
        totalOilLiters: stats._sum.oilOutput ?? 0,
        totalCO2Avoided: stats._sum.co2Avoided ?? 0,
      }}
    />
  );
}
