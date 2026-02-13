"use client";

import Link from "next/link";

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
  stopReason: string | null;
  operators: string[];
  labResults: { id: string; labName: string; verdict: string | null }[];
  certificates: { id: string; code: string }[];
  _count: { readings: number; events: number; photos: number };
}

interface DashboardProps {
  batches: BatchSummary[];
  stats: {
    totalBatches: number;
    completedBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: "COMPLETADO", color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  ACTIVE: { label: "ACTIVO", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  INCOMPLETE: { label: "INCOMPLETO", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  TEST: { label: "PRUEBA", color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
};

export function Dashboard({ batches, stats }: DashboardProps) {
  const kpis = [
    { value: stats.totalFeedstockKg, unit: "kg", label: "Plástico procesado", color: "#34D399" },
    { value: stats.totalOilLiters, unit: "L", label: "Aceite producido", color: "#A78BFA" },
    { value: stats.totalBatches, unit: "", label: "Lotes totales", color: "#60A5FA" },
    { value: stats.totalCO2Avoided.toFixed(1), unit: "kg CO₂eq", label: "Emisiones evitadas", color: "#F97316" },
  ];

  return (
    <div className="min-h-screen bg-eco-bg">
      {/* Header */}
      <header className="border-b border-eco-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tighter text-eco-green font-mono">
            ECONOVA
          </h1>
          <span className="text-[9px] tracking-[4px] text-white/20 uppercase">Trace</span>
        </div>
        <div className="text-[10px] text-white/20 font-mono">v0.1.0</div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-eco-surface border border-eco-border rounded-xl p-5"
            >
              <div className="flex items-baseline gap-1">
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-[11px] text-white/30">{kpi.unit}</span>
                )}
              </div>
              <div className="text-[10px] text-white/30 mt-1 tracking-wider uppercase">
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {/* Batch List */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] tracking-[3px] text-white/30 uppercase">
            Lotes
          </span>
          <Link
            href="/batch/new"
            className="bg-eco-green text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-eco-green/90 transition-colors"
          >
            + Nuevo
          </Link>
        </div>

        <div className="space-y-2">
          {batches.map((batch) => {
            const st = STATUS_CONFIG[batch.status] || STATUS_CONFIG.TEST;
            return (
              <Link
                key={batch.id}
                href={`/batch/${batch.id}`}
                className="block bg-eco-surface border border-eco-border rounded-xl p-5 hover:border-white/12 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm font-bold">
                        {batch.code.split("-").slice(-2).join("-")}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs text-white/30">
                      {batch.feedstockWeight} kg {batch.feedstockType} · {batch.feedstockOrigin}
                    </div>
                  </div>
                  <div className="text-right">
                    {batch.oilOutput != null && batch.oilOutput > 0 && (
                      <div className="font-mono text-sm text-eco-purple font-semibold">
                        {batch.oilOutput} L
                      </div>
                    )}
                    {batch.co2Avoided != null && batch.co2Avoided > 0 && (
                      <div className="text-[10px] text-eco-green">
                        −{batch.co2Avoided.toFixed(0)} kg CO₂
                      </div>
                    )}
                    <div className="text-[10px] text-white/15 mt-1">
                      {new Date(batch.date).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
