"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ImpactDashboard } from "@/components/impact/ImpactDashboard";

// Dynamic imports for heavy dependencies
const MexicoTraceabilityMap = dynamic(
  () => import("@/components/map/MexicoTraceabilityMap").then((mod) => mod.MexicoTraceabilityMap),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-eco-surface-2 rounded-2xl" /> }
);
const LabDashboard = dynamic(
  () => import("@/components/lab/LabDashboard").then((mod) => mod.LabDashboard),
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

interface LabResultSerialized {
  id: string;
  batchId: string;
  labName: string;
  labCertification: string | null;
  sampleNumber: string;
  lotNumber: string | null;
  reportDate: string;
  productClassification: string | null;
  crepitation: string | null;
  appearance: string | null;
  viscosity40C: number | null;
  color: string | null;
  waterContent: number | null;
  sulfurPercent: number | null;
  flashPoint: number | null;
  density15C: number | null;
  carbonResidue: number | null;
  ashContent: number | null;
  calorificMJ: number | null;
  density20C: number | null;
  viscDynamic20C: number | null;
  flashPointOpen: number | null;
  calorificCalG: number | null;
  waterSedimentPct: number | null;
  waterByKFPct: number | null;
  labNotes: string | null;
  verdict: string | null;
  analystName: string | null;
  batch: {
    id: string;
    code: string;
    date: string;
    status: string;
    feedstockType: string;
    oilOutput: number | null;
  };
}

interface LabStats {
  totalLabs: number;
  uniqueLabs: number;
  batchesWithLab: number;
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
  labResults: LabResultSerialized[];
  labStats: LabStats;
  defaultTab?: string;
}

/* ── Tab config ── */
const TABS = [
  { id: "rendimiento", label: "Rendimiento" },
  { id: "impacto", label: "Impacto Ambiental" },
  { id: "origenes", label: "Orígenes" },
  { id: "laboratorio", label: "Laboratorio" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ── Component ── */
export function AnalyticsUnified({
  batches,
  summary,
  impactData,
  mapBatches,
  labResults,
  labStats,
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
        {activeTab === "laboratorio" && (
          <LabDashboard labResults={labResults} stats={labStats} />
        )}
      </div>
    </div>
  );
}
