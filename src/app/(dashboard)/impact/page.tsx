import { prisma } from "@/lib/prisma";
import { calculateGHG } from "@/lib/ghg";
import { ImpactDashboard } from "@/components/impact/ImpactDashboard";

export default async function ImpactPage() {
  const batches = await prisma.batch.findMany({
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
  });

  const totalBatches = await prisma.batch.count();
  const completedBatches = batches.length;

  let totalCO2Avoided = 0;
  let totalCO2Baseline = 0;
  let totalFeedstockKg = 0;
  let totalOilLiters = 0;
  let totalProcessEmissions = 0;
  let totalOilCombustion = 0;
  let totalCharSequestration = 0;
  let totalProjectEmissions = 0;
  let contaminationSum = 0;

  for (const b of batches) {
    totalCO2Avoided += b.co2Avoided ?? 0;
    totalCO2Baseline += b.co2Baseline ?? 0;
    totalFeedstockKg += b.feedstockWeight;
    totalOilLiters += b.oilOutput ?? 0;
    contaminationSum += b.contaminationPct ?? 15;

    // Recalculate for breakdown
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
    completedBatches > 0 ? contaminationSum / completedBatches : 15;

  return (
    <ImpactDashboard
      totalCO2Avoided={totalCO2Avoided}
      totalCO2Baseline={totalCO2Baseline}
      totalFeedstockKg={totalFeedstockKg}
      totalOilLiters={totalOilLiters}
      totalBatches={totalBatches}
      completedBatches={completedBatches}
      avgContamination={avgContamination}
      totalProcessEmissions={totalProcessEmissions}
      totalOilCombustion={totalOilCombustion}
      totalCharSequestration={totalCharSequestration}
      totalProjectEmissions={totalProjectEmissions}
    />
  );
}
