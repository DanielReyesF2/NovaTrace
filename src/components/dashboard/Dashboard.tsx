"use client";

import { HeroStatsBar } from "./HeroStatsBar";
import { ProductionOverviewChart } from "./ProductionOverviewChart";
import { YieldEfficiencyChart } from "./YieldEfficiencyChart";
import { BatchPerformanceHeatMap } from "./BatchPerformanceHeatMap";
import { BatchStatusRing } from "./BatchStatusRing";
import { CO2ImpactMini } from "./CO2ImpactMini";
import { ActivityFeed } from "./ActivityFeed";
import { BatchCompactTable } from "./BatchCompactTable";
import { TraceabilityPipeline } from "./TraceabilityPipeline";
import { NovaAISummary } from "./NovaAISummary";

/* ── Types ── */
interface BatchSummary {
  id: string;
  code: string;
  date: string;
  status: string;
  feedstockType: string;
  feedstockOrigin: string;
  feedstockWeight: number;
  oilOutput: number | null;
  yieldPercent: number | null;
  co2Avoided: number | null;
  co2Baseline: number | null;
  co2Project: number | null;
  maxReactorTemp: number | null;
  durationMinutes: number | null;
  stopReason: string | null;
  operators: string[];
  labResults: { id: string; labName: string; verdict: string | null }[];
  certificates: { id: string; code: string }[];
  _count: { readings: number; events: number; photos: number };
}

interface RecentEvent {
  id: string;
  timestamp: string;
  type: string;
  detail: string;
  batch: { code: string; id: string };
}

interface DashboardProps {
  batches: BatchSummary[];
  recentEvents: RecentEvent[];
  stats: {
    totalBatches: number;
    completedBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
    totalCO2Baseline: number;
    inProgressBatches: number;
  };
}

/* ── Component ── */
export function Dashboard({ batches, recentEvents, stats }: DashboardProps) {
  const totalCerts = batches.reduce((s, b) => s + b.certificates.length, 0);
  const lastBatchId = batches.length > 0 ? batches[0].id : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">

      {/* ROW 1: Hero Stats Bar */}
      <HeroStatsBar batches={batches} stats={stats} />

      {/* ROW 2: Production + Yield side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProductionOverviewChart batches={batches} />
        <YieldEfficiencyChart batches={batches} />
      </div>

      {/* ROW 3: Heat Map (full width) */}
      <BatchPerformanceHeatMap batches={batches} />

      {/* ROW 4: Status Ring + CO₂ Impact + Activity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <BatchStatusRing batches={batches} />
        <CO2ImpactMini batches={batches} stats={stats} />
        <ActivityFeed events={recentEvents} />
      </div>

      {/* ROW 5: Compact Table + Pipeline & Nova AI */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <BatchCompactTable batches={batches} />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <TraceabilityPipeline stats={stats} totalCerts={totalCerts} />
          <NovaAISummary lastBatchId={lastBatchId} />
        </div>
      </div>

    </div>
  );
}
