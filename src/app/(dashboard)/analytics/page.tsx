import { prisma } from "@/lib/prisma";
import { calculateGHG } from "@/lib/ghg";
import { AnalyticsUnified } from "@/components/analytics/AnalyticsUnified";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams;

  // Unified data fetch — all 3 tabs in one round-trip
  const [allBatches, aggregate, completedCount, completedBatches, mapBatches] =
    await Promise.all([
      // Analytics tab: all batches with full detail
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

      // Completed count
      prisma.batch.count({ where: { status: "COMPLETED" } }),

      // Impact tab: completed batches for GHG calculation
      prisma.batch.findMany({
        where: { status: "COMPLETED" },
        select: {
          feedstockWeight: true,
          contaminationPct: true,
          oilOutput: true,
          dieselConsumedL: true,
          durationMinutes: true,
          co2Avoided: true,
          co2Baseline: true,
          co2Project: true,
        },
      }),

      // Map tab: batch origins
      prisma.batch.findMany({
        orderBy: { date: "asc" },
        select: {
          code: true,
          feedstockOrigin: true,
          feedstockWeight: true,
          feedstockType: true,
          status: true,
        },
      }),
    ]);

  // Calculate GHG breakdown for Impact tab
  let totalCO2Avoided = 0;
  let totalCO2Baseline = 0;
  let totalFeedstockKg = 0;
  let totalOilLiters = 0;
  let totalProcessEmissions = 0;
  let totalOilCombustion = 0;
  let totalCharSequestration = 0;
  let totalProjectEmissions = 0;
  let contaminationSum = 0;

  for (const b of completedBatches) {
    totalCO2Avoided += b.co2Avoided ?? 0;
    totalCO2Baseline += b.co2Baseline ?? 0;
    totalFeedstockKg += b.feedstockWeight;
    totalOilLiters += b.oilOutput ?? 0;
    contaminationSum += b.contaminationPct ?? 15;

    if (b.oilOutput != null && b.oilOutput > 0) {
      const ghg = calculateGHG({
        feedstockKg: b.feedstockWeight,
        contaminationPct: b.contaminationPct ?? 15,
        oilLiters: b.oilOutput,
        dieselConsumedL: b.dieselConsumedL ?? undefined,
        durationHours: b.durationMinutes ? b.durationMinutes / 60 : undefined,
      });
      totalProcessEmissions += ghg.processEmissions;
      totalOilCombustion += ghg.oilCombustion;
      totalCharSequestration += ghg.charSequestration;
      totalProjectEmissions += ghg.projectTotal;
    }
  }

  const avgContamination =
    completedBatches.length > 0 ? contaminationSum / completedBatches.length : 15;

  return (
    <AnalyticsUnified
      batches={JSON.parse(JSON.stringify(allBatches))}
      summary={{
        totalBatches: aggregate._count,
        completedBatches: completedCount,
        totalFeedstockKg: aggregate._sum.feedstockWeight ?? 0,
        totalOilLiters: aggregate._sum.oilOutput ?? 0,
        totalCO2Avoided: aggregate._sum.co2Avoided ?? 0,
        totalCO2Baseline: aggregate._sum.co2Baseline ?? 0,
      }}
      impactData={{
        totalCO2Avoided,
        totalCO2Baseline,
        totalFeedstockKg,
        totalOilLiters,
        totalBatches: aggregate._count,
        completedBatches: completedBatches.length,
        avgContamination,
        totalProcessEmissions,
        totalOilCombustion,
        totalCharSequestration,
        totalProjectEmissions,
      }}
      mapBatches={JSON.parse(JSON.stringify(mapBatches))}
      defaultTab={params.tab ?? "rendimiento"}
    />
  );
}
