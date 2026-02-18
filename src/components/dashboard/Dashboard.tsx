"use client";

import Link from "next/link";
import { NovaAISummary } from "./NovaAISummary";
import { TraceabilityPipeline } from "./TraceabilityPipeline";
import { MexicoMapCard } from "@/components/map/MexicoTraceabilityMap";

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
  lastBatchId: string | null;
  stats: {
    totalBatches: number;
    completedBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
    totalCO2Baseline: number;
  };
}

/* ── Config ── */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  COMPLETED: { label: "Completado", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)", icon: "✓" },
  IN_PROGRESS: { label: "En proceso", color: "#2D8CF0", bg: "rgba(45,140,240,0.08)", icon: "◉" },
  ACTIVE: { label: "Activo", color: "#E8700A", bg: "rgba(232,112,10,0.08)", icon: "◉" },
  INCOMPLETE: { label: "Incompleto", color: "#DC2626", bg: "rgba(220,38,38,0.06)", icon: "○" },
  FAILED: { label: "Fallido", color: "#DC2626", bg: "rgba(220,38,38,0.06)", icon: "✕" },
  TEST: { label: "Prueba", color: "#7C5CFC", bg: "rgba(124,92,252,0.08)", icon: "◇" },
};

const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  PHASE_CHANGE: { icon: "⚡", color: "#3d7a0a" },
  INCIDENT: { icon: "⚠", color: "#DC2626" },
  VALVE_CHANGE: { icon: "🔧", color: "#E8700A" },
  EQUIPMENT_TOGGLE: { icon: "⚙", color: "#2D8CF0" },
  FUEL_ADD: { icon: "🔥", color: "#7C5CFC" },
  OBSERVATION: { icon: "👁", color: "rgba(39,57,73,0.5)" },
};

/* ── Component ── */
export function Dashboard({ batches, recentEvents, lastBatchId, stats }: DashboardProps) {
  const avgYield =
    stats.totalFeedstockKg > 0
      ? ((stats.totalOilLiters / stats.totalFeedstockKg) * 100).toFixed(1)
      : "0";

  const reductionPct =
    stats.totalCO2Baseline > 0
      ? ((1 - (stats.totalCO2Avoided > 0 ? (stats.totalCO2Baseline - stats.totalCO2Avoided) / stats.totalCO2Baseline : 1)) * 100).toFixed(0)
      : "0";

  const treesEquiv = Math.round(stats.totalCO2Avoided / 22);
  const totalReadings = batches.reduce((s, b) => s + b._count.readings, 0);
  const totalEvents = batches.reduce((s, b) => s + b._count.events, 0);
  const totalCerts = batches.reduce((s, b) => s + b.certificates.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* ═══ HERO: Environmental Impact Banner ═══ */}
      <div className="relative overflow-hidden bg-eco-navy rounded-3xl p-8 md:p-10">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="text-white/30 text-[11px] tracking-[4px] uppercase font-medium mb-4">
                Impacto ambiental acumulado
              </p>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-5xl md:text-6xl font-semibold tracking-tighter text-eco-green">
                  {stats.totalCO2Avoided.toFixed(1)}
                </span>
                <span className="text-white/25 text-sm font-light tracking-tight">kg CO₂eq</span>
              </div>
              <p className="text-white/20 text-[13px] font-light mt-3 tracking-wide">
                emisiones evitadas · equivalente a <span className="text-eco-green/50 font-medium">{treesEquiv} árboles</span> absorbiendo CO₂ por un año
              </p>
            </div>
            <div className="flex gap-8 md:gap-10">
              <div className="text-center">
                <div className="font-mono text-2xl font-semibold tracking-tight text-white">{stats.totalFeedstockKg}</div>
                <div className="text-[10px] text-white/20 uppercase tracking-[3px] mt-1 font-medium">kg plástico</div>
              </div>
              <div className="w-px bg-white/[0.06] self-stretch" />
              <div className="text-center">
                <div className="font-mono text-2xl font-semibold tracking-tight text-eco-green">{stats.totalOilLiters}</div>
                <div className="text-[10px] text-white/20 uppercase tracking-[3px] mt-1 font-medium">L aceite</div>
              </div>
              <div className="w-px bg-white/[0.06] self-stretch" />
              <div className="text-center">
                <div className="font-mono text-2xl font-semibold tracking-tight text-white">{avgYield}<span className="text-base font-light">%</span></div>
                <div className="text-[10px] text-white/20 uppercase tracking-[3px] mt-1 font-medium">rendimiento</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ LIFECYCLE + MAP (side by side) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TraceabilityPipeline stats={stats} totalCerts={totalCerts} />
        <MexicoMapCard batches={batches} />
      </div>

      {/* ═══ TWO-COLUMN: Operational KPIs + Activity Feed ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left: KPI cards (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Completados */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] text-eco-muted font-medium tracking-wide">Lotes completados</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(61,122,10,0.08)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3d7a0a" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold tracking-tight" style={{ color: "#3d7a0a" }}>
                  {stats.completedBatches}
                </span>
                <span className="text-[13px] text-eco-muted font-light">de {stats.totalBatches}</span>
              </div>
              <div className="mt-4 h-1.5 bg-eco-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${stats.totalBatches > 0 ? (stats.completedBatches / stats.totalBatches) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #3d7a0a, #5a9a1a)",
                  }}
                />
              </div>
            </div>

            {/* Lecturas térmicas */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] text-eco-muted font-medium tracking-wide">Lecturas térmicas</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(45,140,240,0.08)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2D8CF0" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold tracking-tight text-eco-blue">{totalReadings}</span>
                <span className="text-[13px] text-eco-muted font-light">registros</span>
              </div>
              <p className="text-[11px] text-eco-muted-2 mt-3 font-light">
                {totalEvents} eventos de proceso registrados
              </p>
            </div>

            {/* Certificados */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] text-eco-muted font-medium tracking-wide">Certificados</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(232,112,10,0.08)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8700A" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold tracking-tight text-eco-orange">{totalCerts}</span>
                <span className="text-[13px] text-eco-muted font-light">emitidos</span>
              </div>
              <p className="text-[11px] text-eco-muted-2 mt-3 font-light">
                {batches.filter(b => b.labResults.length > 0).length} con resultados de lab
              </p>
            </div>

            {/* CO₂ Reduction */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] text-eco-muted font-medium tracking-wide">Reducción CO₂</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(61,122,10,0.08)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3d7a0a" strokeWidth="2" strokeLinecap="round">
                    <path d="M23 6l-9.5 9.5-5-5L1 18" />
                    <path d="M17 6h6v6" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-semibold tracking-tight" style={{ color: "#3d7a0a" }}>{reductionPct}%</span>
              </div>
              <p className="text-[11px] text-eco-muted-2 mt-3 font-light">
                vs quema a cielo abierto (IPCC 2006)
              </p>
            </div>
          </div>

          {/* Batch-by-batch performance bars */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-black/[0.03]">
            <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-5">
              Rendimiento por lote
            </h3>
            <div className="space-y-3">
              {batches.map((batch) => {
                const st = STATUS_CONFIG[batch.status] || STATUS_CONFIG.TEST;
                const maxWeight = Math.max(...batches.map(b => b.feedstockWeight), 1);
                const feedPct = (batch.feedstockWeight / maxWeight) * 100;
                const oilPct = batch.oilOutput
                  ? (batch.oilOutput / batch.feedstockWeight) * 100
                  : 0;

                return (
                  <Link
                    key={batch.id}
                    href={`/batch/${batch.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]" style={{ color: st.color }}>{st.icon}</span>
                        <span className="font-mono text-xs font-semibold text-eco-ink group-hover:text-eco-navy-light transition-colors">
                          {batch.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-eco-muted">
                        <span>{batch.feedstockWeight} kg</span>
                        {batch.oilOutput != null && batch.oilOutput > 0 && (
                          <>
                            <span>→</span>
                            <span className="text-eco-purple font-semibold">{batch.oilOutput} L</span>
                            <span className="font-mono" style={{ color: "#3d7a0a" }}>({oilPct.toFixed(0)}%)</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 h-2.5">
                      {/* Feedstock bar */}
                      <div className="flex-1 bg-eco-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${feedPct}%`,
                            background: `${st.color}40`,
                          }}
                        />
                      </div>
                      {/* Oil output bar overlay */}
                      {batch.oilOutput != null && batch.oilOutput > 0 && (
                        <div className="w-16 bg-eco-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(oilPct * 2, 100)}%`,
                              background: "linear-gradient(90deg, #7C5CFC, #9d7dff)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/[0.04]">
              <div className="flex items-center gap-1.5 text-[10px] text-eco-muted font-medium">
                <div className="w-3 h-1.5 rounded-full bg-eco-muted-2" />
                Feedstock (kg)
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-eco-muted font-medium">
                <div className="w-3 h-1.5 rounded-full bg-eco-purple" />
                Aceite (L)
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activity Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Activity timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-black/[0.03]">
            <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-5">
              Actividad reciente
            </h3>
            {recentEvents.length > 0 ? (
              <div className="space-y-0">
                {recentEvents.map((event, i) => {
                  const evStyle = EVENT_ICONS[event.type] || EVENT_ICONS.OBSERVATION;
                  return (
                    <div key={event.id} className="flex gap-3 relative">
                      {/* Timeline line */}
                      {i < recentEvents.length - 1 && (
                        <div className="absolute left-[11px] top-7 bottom-0 w-px bg-eco-border" />
                      )}
                      {/* Dot */}
                      <div
                        className="w-[23px] h-[23px] rounded-full flex items-center justify-center text-[10px] flex-shrink-0 z-10"
                        style={{ background: `${evStyle.color}15`, border: `1.5px solid ${evStyle.color}30` }}
                      >
                        {evStyle.icon}
                      </div>
                      {/* Content */}
                      <div className="pb-4 min-w-0 flex-1">
                        <p className="text-xs text-eco-ink leading-snug">{event.detail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Link
                            href={`/batch/${event.batch.id}`}
                            className="text-[9px] font-mono text-eco-blue hover:underline"
                          >
                            {event.batch.code}
                          </Link>
                          <span className="text-[9px] text-eco-muted-2">
                            {new Date(event.timestamp).toLocaleString("es-MX", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-eco-muted-2">
                <div className="text-xl mb-1">📋</div>
                <p className="text-xs">Sin eventos registrados</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-black/[0.03]">
            <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
              Acciones rápidas
            </h3>
            <div className="space-y-2">
              <Link
                href="/batch/new"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-eco-navy text-white hover:bg-eco-navy-light transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-[13px] font-medium">Nuevo lote de pirólisis</span>
              </Link>
              <Link
                href="/batch/new"
                className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-eco-green/20 bg-eco-green/[0.04] text-eco-ink hover:border-eco-green/40 hover:bg-eco-green/[0.08] transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d7a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17,21 17,13 7,13 7,21" />
                  <polyline points="7,3 7,8 15,8" />
                </svg>
                <span className="text-[13px] font-medium" style={{ color: "#3d7a0a" }}>Registro Diario</span>
              </Link>
              {batches.length > 0 && (
                <Link
                  href={`/batch/${batches[0].id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-eco-border hover:border-eco-border-strong hover:bg-eco-surface-2/50 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                  </svg>
                  <div>
                    <span className="text-xs font-semibold text-eco-ink">Ver último lote</span>
                    <span className="text-[9px] text-eco-muted ml-1.5 font-mono">
                      {batches[0].code}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Nova AI Widget */}
          <NovaAISummary lastBatchId={lastBatchId} />
        </div>
      </div>

    </div>
  );
}
