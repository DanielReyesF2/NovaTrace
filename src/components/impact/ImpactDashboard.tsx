"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { GHGWaterfallChart } from "./GHGWaterfallChart";
import { EquivalenceCards } from "./EquivalenceCards";
import { CarbonCreditCalculator } from "./CarbonCreditCalculator";
import { ScalingProjections } from "./ScalingProjections";
import { MaterialFlowDiagram } from "@/components/flow/MaterialFlowDiagram";

interface ImpactDashboardProps {
  totalCO2Avoided: number;
  totalCO2Baseline: number;
  totalFeedstockKg: number;
  totalOilLiters: number;
  totalBatches: number;
  completedBatches: number;
  avgContamination: number;
  // Aggregated GHG breakdown
  totalProcessEmissions: number;
  totalOilCombustion: number;
  totalCharSequestration: number;
  totalProjectEmissions: number;
}

export function ImpactDashboard({
  totalCO2Avoided,
  totalCO2Baseline,
  totalFeedstockKg,
  totalOilLiters,
  totalBatches,
  completedBatches,
  avgContamination,
  totalProcessEmissions,
  totalOilCombustion,
  totalCharSequestration,
  totalProjectEmissions,
}: ImpactDashboardProps) {
  const reductionPct =
    totalCO2Baseline > 0
      ? ((totalCO2Avoided / totalCO2Baseline) * 100).toFixed(0)
      : "0";

  // Estimate monthly CO2 rate (5 months of data)
  const monthsActive = 5;
  const monthlyCO2 = totalCO2Avoided / monthsActive;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-eco-ink">
          Impacto Ambiental
        </h1>
        <p className="text-[13px] text-eco-muted mt-1 font-light">
          Análisis de ciclo de vida · Metodología IPCC 2006
        </p>
      </div>

      {/* HERO: Total CO2 Avoided */}
      <div className="relative overflow-hidden bg-eco-navy rounded-3xl p-8 md:p-10 text-center">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
        <div className="relative">
          <p className="text-white/30 text-[11px] tracking-[4px] uppercase mb-4 font-medium">
            Emisiones totales evitadas
          </p>
          <div className="flex items-baseline justify-center gap-3">
            <AnimatedCounter
              value={totalCO2Avoided}
              decimals={1}
              className="font-mono text-5xl md:text-6xl font-semibold tracking-tighter text-eco-green"
              duration={2000}
            />
            <span className="text-white/25 text-sm font-light tracking-tight">kg CO₂eq</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="inline-block font-mono text-xs font-semibold px-3 py-1.5 rounded-full text-eco-green bg-eco-green/10">
              ↓ {reductionPct}% vs quema abierta
            </span>
            <span className="text-white/20 text-[13px] font-light">
              {completedBatches} lotes completados
            </span>
          </div>
        </div>
      </div>

      {/* GHG Waterfall + Equivalences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GHGWaterfallChart
          baseline={totalCO2Baseline}
          processEmissions={totalProcessEmissions}
          oilCombustion={totalOilCombustion}
          charSequestration={totalCharSequestration}
          projectTotal={totalProjectEmissions}
        />
        <EquivalenceCards co2Avoided={totalCO2Avoided} />
      </div>

      {/* Material Flow Diagram */}
      <MaterialFlowDiagram
        feedstockKg={totalFeedstockKg}
        contaminationPct={avgContamination}
        oilLiters={totalOilLiters}
      />

      {/* Carbon Credit Calculator */}
      <CarbonCreditCalculator
        totalCO2Avoided={totalCO2Avoided}
        totalBatches={totalBatches}
        monthsActive={monthsActive}
      />

      {/* Scaling Projections */}
      <ScalingProjections currentMonthlyCO2={monthlyCO2} />
    </div>
  );
}
