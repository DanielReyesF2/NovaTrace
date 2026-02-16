"use client";

import Link from "next/link";
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

  // Process pipeline counts
  const pipelineSteps = [
    {
      label: "Recolectado",
      value: stats.totalBatches,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        </svg>
      ),
      color: "#273949",
    },
    {
      label: "Procesado",
      value: `${stats.totalFeedstockKg} kg`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
      color: "#E8700A",
    },
    {
      label: "Producido",
      value: `${stats.totalOilLiters} L`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
        </svg>
      ),
      color: "#7C5CFC",
    },
    {
      label: "Certificado",
      value: totalCerts,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      color: "#3d7a0a",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

      {/* ═══ HERO: Environmental Impact Banner ═══ */}
      <div className="relative overflow-hidden bg-eco-navy rounded-2xl p-6 md:p-8">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/40 text-[10px] tracking-[3px] uppercase mb-3">
                Impacto ambiental acumulado
              </p>
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-4xl md:text-5xl font-black text-eco-green">
                  {stats.totalCO2Avoided.toFixed(1)}
                </span>
                <span className="text-white/40 font-mono text-sm">kg CO₂eq</span>
              </div>
              <p className="text-white/30 text-xs mt-1.5">
                emisiones evitadas · equivalente a <span className="text-eco-green/70 font-semibold">{treesEquiv} árboles</span> absorbiendo CO₂ por un año
              </p>
            </div>
            <div className="flex gap-5 md:gap-8">
              <div className="text-center">
                <div className="font-mono text-2xl font-bold text-white">{stats.totalFeedstockKg}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">kg plástico</div>
              </div>
              <div className="w-px bg-white/10 self-stretch" />
              <div className="text-center">
                <div className="font-mono text-2xl font-bold text-eco-green">{stats.totalOilLiters}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">L aceite</div>
              </div>
              <div className="w-px bg-white/10 self-stretch" />
              <div className="text-center">
                <div className="font-mono text-2xl font-bold text-white">{avgYield}<span className="text-base">%</span></div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">rendimiento</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PROCESS PIPELINE ═══ */}
      <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
        <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
          Pipeline de trazabilidad
        </h3>
        <div className="grid grid-cols-4 gap-0 relative">
          {/* Connector line */}
          <div className="absolute top-6 left-[12.5%] right-[12.5%] h-px bg-eco-border z-0" />
          {pipelineSteps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2"
                style={{
                  borderColor: step.color,
                  backgroundColor: `${step.color}10`,
                  color: step.color,
                }}
              >
                {step.icon}
              </div>
              <div className="font-mono text-sm font-bold text-eco-ink">{step.value}</div>
              <div className="text-[9px] text-eco-muted uppercase tracking-wider mt-0.5">{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TWO-COLUMN: Operational KPIs + Activity Feed ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left: KPI cards (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Completados */}
            <div className="bg-eco-surface border border-eco-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-eco-muted uppercase tracking-wider">Lotes completados</span>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(61,122,10,0.1)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3d7a0a" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold" style={{ color: "#3d7a0a" }}>
                  {stats.completedBatches}
                </span>
                <span className="text-xs text-eco-muted">de {stats.totalBatches}</span>
              </div>
              <div className="mt-3 h-2 bg-eco-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalBatches > 0 ? (stats.completedBatches / stats.totalBatches) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #3d7a0a, #5a9a1a)",
                  }}
                />
              </div>
            </div>

            {/* Lecturas térmicas */}
            <div className="bg-eco-surface border border-eco-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-eco-muted uppercase tracking-wider">Lecturas térmicas</span>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(45,140,240,0.1)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D8CF0" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold text-eco-blue">{totalReadings}</span>
                <span className="text-xs text-eco-muted">registros</span>
              </div>
              <p className="text-[10px] text-eco-muted-2 mt-2">
                {totalEvents} eventos de proceso registrados
              </p>
            </div>

            {/* Certificados */}
            <div className="bg-eco-surface border border-eco-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-eco-muted uppercase tracking-wider">Certificados</span>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(232,112,10,0.1)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8700A" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold text-eco-orange">{totalCerts}</span>
                <span className="text-xs text-eco-muted">emitidos</span>
              </div>
              <p className="text-[10px] text-eco-muted-2 mt-2">
                {batches.filter(b => b.labResults.length > 0).length} con resultados de lab
              </p>
            </div>

            {/* CO₂ Reduction */}
            <div className="bg-eco-surface border border-eco-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-eco-muted uppercase tracking-wider">Reducción CO₂</span>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(61,122,10,0.1)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3d7a0a" strokeWidth="2" strokeLinecap="round">
                    <path d="M23 6l-9.5 9.5-5-5L1 18" />
                    <path d="M17 6h6v6" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold" style={{ color: "#3d7a0a" }}>{reductionPct}%</span>
              </div>
              <p className="text-[10px] text-eco-muted-2 mt-2">
                vs quema a cielo abierto (IPCC 2006)
              </p>
            </div>
          </div>

          {/* Batch-by-batch performance bars */}
          <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
            <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
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
                          {batch.code.split("-").slice(-2).join("-")}
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
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-eco-border">
              <div className="flex items-center gap-1.5 text-[9px] text-eco-muted">
                <div className="w-3 h-1.5 rounded-full bg-eco-muted-2" />
                Feedstock (kg)
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-eco-muted">
                <div className="w-3 h-1.5 rounded-full bg-eco-purple" />
                Aceite (L)
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activity Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Activity timeline */}
          <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
            <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
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
                            {event.batch.code.split("-").slice(-2).join("-")}
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
          <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
            <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-3">
              Acciones rápidas
            </h3>
            <div className="space-y-2">
              <Link
                href="/batch/new"
                className="flex items-center gap-3 p-3 rounded-lg bg-eco-navy text-white hover:bg-eco-navy-light transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-xs font-semibold">Nuevo lote de pirólisis</span>
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
                      {batches[0].code.split("-").slice(-2).join("-")}
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

      {/* ═══ BATCH LIST ═══ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] tracking-[3px] text-eco-muted uppercase">
            Todos los lotes
          </span>
        </div>

        <div className="space-y-2">
          {batches.map((batch) => {
            const st = STATUS_CONFIG[batch.status] || STATUS_CONFIG.TEST;
            const hasLab = batch.labResults.length > 0;
            const hasCert = batch.certificates.length > 0;

            return (
              <Link
                key={batch.id}
                href={`/batch/${batch.id}`}
                className="group block bg-eco-surface border border-eco-border rounded-xl p-4 md:p-5 hover:border-eco-border-strong card-hover"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-xs" style={{ color: st.color }}>{st.icon}</span>
                      <span className="font-mono text-sm font-bold text-eco-ink">
                        {batch.code.split("-").slice(-2).join("-")}
                      </span>
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                      {/* Tags */}
                      {batch._count.readings > 0 && (
                        <span className="hidden md:inline-flex items-center gap-1 text-[9px] text-eco-muted bg-eco-surface-2 px-1.5 py-0.5 rounded-full">
                          📈 {batch._count.readings}
                        </span>
                      )}
                      {hasLab && (
                        <span className="hidden md:inline-flex text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ color: "#7C5CFC", background: "rgba(124,92,252,0.08)" }}>
                          Lab
                        </span>
                      )}
                      {hasCert && (
                        <span className="hidden md:inline-flex text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ color: "#3d7a0a", background: "rgba(61,122,10,0.08)" }}>
                          Cert
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-eco-muted">
                      {batch.feedstockWeight} kg {batch.feedstockType} · {batch.feedstockOrigin}
                      {batch.durationMinutes != null && (
                        <span> · {Math.floor(batch.durationMinutes / 60)}h {batch.durationMinutes % 60}m</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-4">
                    <div>
                      {batch.oilOutput != null && batch.oilOutput > 0 && (
                        <div className="font-mono text-sm text-eco-purple font-bold">
                          {batch.oilOutput} L
                        </div>
                      )}
                      {batch.co2Avoided != null && batch.co2Avoided > 0 && (
                        <div className="text-[10px] font-semibold" style={{ color: "#3d7a0a" }}>
                          ↓ {batch.co2Avoided.toFixed(0)} kg CO₂
                        </div>
                      )}
                      <div className="text-[10px] text-eco-muted-2 mt-0.5">
                        {new Date(batch.date).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      className="text-eco-muted-2 group-hover:text-eco-ink-light transition-colors">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
