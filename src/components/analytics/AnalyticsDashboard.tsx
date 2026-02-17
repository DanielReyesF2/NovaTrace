"use client";

import { KPICard } from "./KPICard";
import { CO2TimeChart } from "./CO2TimeChart";
import { ThroughputChart } from "./ThroughputChart";
import { YieldTrendChart } from "./YieldTrendChart";
import { BatchComparisonTable } from "./BatchComparisonTable";
import { BatchLearnings } from "./BatchLearnings";

interface BatchData {
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

interface AnalyticsDashboardProps {
  batches: BatchData[];
  summary: {
    totalBatches: number;
    completedBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
    totalCO2Baseline: number;
  };
}

export function AnalyticsDashboard({ batches, summary }: AnalyticsDashboardProps) {
  const completed = batches.filter((b) => b.status === "COMPLETED");
  const avgYield =
    completed.length > 0
      ? completed.reduce((s, b) => s + (b.yieldPercent ?? 0), 0) / completed.length
      : 0;

  // Calculate month-over-month trends
  const recent = completed.slice(-3);
  const older = completed.slice(-6, -3);
  const recentAvgYield =
    recent.length > 0
      ? recent.reduce((s, b) => s + (b.yieldPercent ?? 0), 0) / recent.length
      : 0;
  const olderAvgYield =
    older.length > 0
      ? older.reduce((s, b) => s + (b.yieldPercent ?? 0), 0) / older.length
      : 0;
  const yieldTrend = olderAvgYield > 0 ? ((recentAvgYield - olderAvgYield) / olderAvgYield) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-eco-ink">
          Analytics & Performance
        </h1>
        <p className="text-[13px] text-eco-muted mt-1 font-light">
          Rendimiento operativo · Oct 2024 – Feb 2025
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Procesado"
          value={summary.totalFeedstockKg}
          suffix=" kg"
          color="#273949"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#273949" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          }
        />
        <KPICard
          title="Total Aceite"
          value={summary.totalOilLiters}
          suffix=" L"
          decimals={1}
          color="#7C5CFC"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
            </svg>
          }
        />
        <KPICard
          title="Yield Promedio"
          value={avgYield}
          suffix="%"
          decimals={1}
          color="#3d7a0a"
          trend={yieldTrend !== 0 ? { value: yieldTrend, label: "vs últimos 3" } : undefined}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d7a0a" strokeWidth="1.5" strokeLinecap="round">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
              <polyline points="17,6 23,6 23,12" />
            </svg>
          }
        />
        <KPICard
          title="CO₂ Evitado Total"
          value={summary.totalCO2Avoided}
          suffix=" kg"
          decimals={1}
          color="#3d7a0a"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d7a0a" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CO2TimeChart data={batches} />
        <ThroughputChart data={batches} />
      </div>

      {/* Yield Trend */}
      <YieldTrendChart data={batches} />

      {/* Base de Conocimiento — Learnings across all batches */}
      <BatchLearnings batches={batches} />

      {/* Batch Comparison Table */}
      <BatchComparisonTable data={batches} />
    </div>
  );
}
