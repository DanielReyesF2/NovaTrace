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
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-eco-ink">
          Impacto Ambiental
        </h1>
        <p className="text-xs text-eco-muted mt-1">
          Análisis de ciclo de vida · Metodología IPCC 2006
        </p>
      </div>

      {/* HERO: Total CO2 Avoided */}
      <div className="relative overflow-hidden bg-eco-navy rounded-2xl p-8 text-center">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="relative">
          <p className="text-white/40 text-[10px] tracking-[3px] uppercase mb-4">
            Emisiones totales evitadas
          </p>
          <div className="flex items-baseline justify-center gap-3">
            <AnimatedCounter
              value={totalCO2Avoided}
              decimals={1}
              className="font-mono text-5xl md:text-6xl font-black text-eco-green"
              duration={2000}
            />
            <span className="text-white/40 font-mono text-lg">kg CO₂eq</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <span className="inline-block font-mono text-xs font-bold px-3 py-1 rounded-full text-eco-green bg-eco-green/15">
              ↓ {reductionPct}% vs quema abierta
            </span>
            <span className="text-white/30 text-xs">
              {completedBatches} lotes completados
            </span>
          </div>
        </div>
      </div>

      {/* GHG Waterfall + Equivalences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
