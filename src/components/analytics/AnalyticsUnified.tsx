"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ImpactDashboard } from "@/components/impact/ImpactDashboard";

// Dynamic import for map (heavy dependency: react-simple-maps)
const MexicoTraceabilityMap = dynamic(
  () => import("@/components/map/MexicoTraceabilityMap").then((mod) => mod.MexicoTraceabilityMap),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-eco-surface-2 rounded-2xl" /> }
);

/* ── Types ── */
interface AnalyticsBatch {
  id: string;
  code: string;
  date: string;
  status: string;
  feedstockType: string;
  feedstockOrigin: string;
  feedstockWeight: number;
  contaminationPct: number | null;
  oilOutput: number | null;
  yieldPercent: number | null;
  durationMinutes: number | null;
  maxReactorTemp: number | null;
  dieselConsumedL: number | null;
  co2Baseline: number | null;
  co2Project: number | null;
  co2Avoided: number | null;
  stopReason: string | null;
  notes: string | null;
  labResults: Array<{
    viscosity40C: number | null;
    waterContent: number | null;
    sulfurPercent: number | null;
    verdict: string | null;
  }>;
  certificates: Array<{ id: string }>;
  _count: { readings: number; events: number };
}

interface ImpactData {
  totalCO2Avoided: number;
  totalCO2Baseline: number;
  totalFeedstockKg: number;
  totalOilLiters: number;
  totalBatches: number;
  completedBatches: number;
  avgContamination: number;
  totalProcessEmissions: number;
  totalOilCombustion: number;
  totalCharSequestration: number;
  totalProjectEmissions: number;
}

interface MapBatch {
  code: string;
  feedstockOrigin: string;
  feedstockWeight: number;
  feedstockType: string;
  status: string;
}

interface AnalyticsUnifiedProps {
  batches: AnalyticsBatch[];
  summary: {
    totalBatches: number;
    completedBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
    totalCO2Baseline: number;
  };
  impactData: ImpactData;
  mapBatches: MapBatch[];
  defaultTab?: string;
}

/* ── Tab config ── */
const TABS = [
  { id: "rendimiento", label: "Rendimiento" },
  { id: "impacto", label: "Impacto Ambiental" },
  { id: "origenes", label: "Orígenes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ── Component ── */
export function AnalyticsUnified({
  batches,
  summary,
  impactData,
  mapBatches,
  defaultTab = "rendimiento",
}: AnalyticsUnifiedProps) {
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.some((t) => t.id === defaultTab) ? (defaultTab as TabId) : "rendimiento"
  );

  return (
    <div>
      {/* Tab bar — Apple-style pills */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-0">
        <div className="flex items-center gap-1 bg-eco-surface-2 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-white text-eco-ink shadow-soft"
                    : "text-eco-muted hover:text-eco-ink"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "rendimiento" && (
          <AnalyticsDashboard batches={batches} summary={summary} />
        )}
        {activeTab === "impacto" && (
          <ImpactDashboard {...impactData} />
        )}
        {activeTab === "origenes" && (
          <MexicoTraceabilityMap batches={mapBatches} />
        )}
      </div>
    </div>
  );
}
