"use client";

import { HeroStatsBar } from "./HeroStatsBar";
import { PlantTwinPreview } from "./PlantTwinPreview";
import { BatchPassportList } from "./BatchPassportList";
import { YieldSparkline } from "./YieldSparkline";

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
  operators: string[];
  labResults: { id: string; labName: string; verdict: string | null }[];
  certificates: { id: string; code: string }[];
}

interface EquipmentSummary {
  id: string;
  name: string;
  tag: string | null;
  type: string;
  calibrationStatus: string;
  calibrationExpiry: string | null;
  location: string | null;
  subsystem: string | null;
  specs: Record<string, unknown> | null;
  _count: { childEquipment: number };
}

interface DashboardProps {
  batches: BatchSummary[];
  equipment: EquipmentSummary[];
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
export function Dashboard({ batches, equipment, stats }: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">

      {/* ROW 1: Hero Stats — 4 clean metrics */}
      <HeroStatsBar batches={batches} stats={stats} />

      {/* ROW 2: Digital Twin 3D + Equipment sidebar */}
      <PlantTwinPreview equipment={equipment} />

      {/* ROW 3: Batch Passports — expandable last 5 */}
      <BatchPassportList batches={batches} />

      {/* ROW 4: Yield sparkline trend */}
      <YieldSparkline batches={batches} />

    </div>
  );
}
