"use client";

import { useState } from "react";
import Link from "next/link";
import { ThermalChart } from "./ThermalChart";
import { ProcessTimeline } from "./ProcessTimeline";
import { AIInsights } from "./AIInsights";
import { BatchScorecard } from "./BatchScorecard";

interface BatchDetailProps {
  batch: {
    id: string;
    code: string;
    date: string;
    status: string;
    feedstockType: string;
    feedstockOrigin: string;
    feedstockWeight: number;
    feedstockCondition: string | null;
    contaminationPct: number | null;
    oilOutput: number | null;
    yieldPercent: number | null;
    durationMinutes: number | null;
    maxReactorTemp: number | null;
    operators: string[];
    stopReason: string | null;
    notes: string | null;
    co2Baseline: number | null;
    co2Project: number | null;
    co2Avoided: number | null;
    readings: Array<{
      id: string;
      timestamp: string;
      reactorTemp: number | null;
      controlTemp: number | null;
      steelTemp: number | null;
      chainTemp: number | null;
      compressorPsi: number | null;
      regulatorPsi: number | null;
      damperPosition: number | null;
    }>;
    events: Array<{
      id: string;
      timestamp: string;
      type: string;
      detail: string;
      notes: string | null;
    }>;
    labResults: Array<{
      id: string;
      labName: string;
      labCertification: string | null;
      sampleNumber: string;
      reportDate: string;
      viscosity40C: number | null;
      sulfurPercent: number | null;
      waterContent: number | null;
      verdict: string | null;
    }>;
    certificates: Array<{
      id: string;
      code: string;
      hash: string;
    }>;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: "Completado", color: "#3d7a0a", bg: "rgba(181,233,81,0.2)" },
  IN_PROGRESS: { label: "En proceso", color: "#2D8CF0", bg: "rgba(45,140,240,0.1)" },
  INCOMPLETE: { label: "Incompleto", color: "#E8700A", bg: "rgba(232,112,10,0.1)" },
  FAILED: { label: "Fallido", color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
};

export function BatchDetail({ batch }: BatchDetailProps) {
  const [showRawData, setShowRawData] = useState(false);
  const status = STATUS_CONFIG[batch.status] || STATUS_CONFIG.INCOMPLETE;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-eco-muted hover:text-eco-ink text-xs transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="text-eco-muted-2">/</span>
          <h1 className="font-mono text-xl font-semibold tracking-tight">{batch.code}</h1>
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ color: status.color, background: status.bg }}
          >
            {status.label}
          </span>
        </div>
        <span className="text-[13px] text-eco-muted font-light">
          {new Date(batch.date).toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03] text-center">
          <div className="font-mono text-2xl font-semibold tracking-tight text-eco-ink">
            {batch.feedstockWeight}
          </div>
          <div className="text-[10px] text-eco-muted uppercase tracking-[2px] mt-1.5 font-medium">
            kg feedstock
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03] text-center">
          <div className="font-mono text-2xl font-semibold tracking-tight text-eco-purple">
            {batch.oilOutput != null && batch.oilOutput > 0
              ? `${batch.oilOutput} L`
              : "—"}
          </div>
          <div className="text-[10px] text-eco-muted uppercase tracking-[2px] mt-1.5 font-medium">
            aceite producido
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03] text-center">
          <div className="font-mono text-2xl font-semibold tracking-tight text-eco-orange">
            {batch.maxReactorTemp != null ? `${batch.maxReactorTemp}°C` : "—"}
          </div>
          <div className="text-[10px] text-eco-muted uppercase tracking-[2px] mt-1.5 font-medium">
            temp máx reactor
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03] text-center">
          <div className="font-mono text-2xl font-semibold tracking-tight" style={{ color: "#3d7a0a" }}>
            {batch.co2Avoided != null && batch.co2Avoided > 0
              ? `−${batch.co2Avoided.toFixed(1)}`
              : "—"}
          </div>
          <div className="text-[10px] text-eco-muted uppercase tracking-[2px] mt-1.5 font-medium">
            kg CO₂eq evitados
          </div>
        </div>
      </div>

      {/* ── Feedstock + Output Side by Side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feedstock */}
        <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
          <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-3">
            Feedstock
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-eco-muted">Tipo</span>
              <span>{batch.feedstockType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-eco-muted">Origen</span>
              <span>{batch.feedstockOrigin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-eco-muted">Peso</span>
              <span className="font-mono font-bold">{batch.feedstockWeight} kg</span>
            </div>
            {batch.contaminationPct != null && (
              <div className="flex justify-between">
                <span className="text-eco-muted">Contaminación</span>
                <span className="font-mono">~{batch.contaminationPct}%</span>
              </div>
            )}
            {batch.feedstockCondition && (
              <div className="flex justify-between">
                <span className="text-eco-muted">Condición</span>
                <span className="text-eco-ink-light">{batch.feedstockCondition}</span>
              </div>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
          <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-3">
            Producto
          </h3>
          {batch.oilOutput != null && batch.oilOutput > 0 ? (
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-eco-muted">Aceite</span>
                <span className="font-mono font-bold text-eco-purple">
                  {batch.oilOutput} L
                </span>
              </div>
              {batch.yieldPercent != null && (
                <div className="flex justify-between">
                  <span className="text-eco-muted">Rendimiento</span>
                  <span className="font-mono">{batch.yieldPercent}%</span>
                </div>
              )}
              {batch.durationMinutes != null && (
                <div className="flex justify-between">
                  <span className="text-eco-muted">Duración</span>
                  <span className="font-mono">
                    {Math.floor(batch.durationMinutes / 60)}h{" "}
                    {batch.durationMinutes % 60}m
                  </span>
                </div>
              )}
              {batch.stopReason && (
                <div className="flex justify-between">
                  <span className="text-eco-muted">Paro</span>
                  <span className="text-eco-ink-light">{batch.stopReason}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-eco-muted-2 text-sm">
              {batch.stopReason || "Sin producción"}
            </div>
          )}
        </div>
      </div>

      {/* ── Thermal Profile ── */}
      {batch.readings.length > 0 && (
        <div>
          <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
            Perfil Térmico
          </h3>
          <ThermalChart readings={batch.readings} events={batch.events} />

          {/* Collapsible raw data */}
          <div className="mt-4 bg-white rounded-2xl shadow-soft border border-black/[0.03] p-4">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center gap-2 text-[10px] text-eco-muted hover:text-eco-ink-light transition-colors w-full"
            >
              <span
                className="transition-transform duration-200"
                style={{
                  display: "inline-block",
                  transform: showRawData ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                ▶
              </span>
              Datos raw ({batch.readings.length} lecturas)
            </button>
            {showRawData && (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-eco-muted border-b border-eco-border">
                      <th className="py-2 text-left">Hora</th>
                      <th className="py-2 text-right">Reactor</th>
                      <th className="py-2 text-right">Control</th>
                      <th className="py-2 text-right">Acero</th>
                      <th className="py-2 text-right">Cadena</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.readings.map((r) => (
                      <tr key={r.id} className="border-b border-eco-border/50 hover:bg-eco-surface-2/30">
                        <td className="py-1.5 text-eco-muted">
                          {new Date(r.timestamp).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-1.5 text-right text-eco-orange font-semibold">
                          {r.reactorTemp != null ? `${r.reactorTemp}°C` : "—"}
                        </td>
                        <td className="py-1.5 text-right text-eco-blue">
                          {r.controlTemp != null ? `${r.controlTemp}°C` : "—"}
                        </td>
                        <td className="py-1.5 text-right text-eco-purple">
                          {r.steelTemp != null ? `${r.steelTemp}°C` : "—"}
                        </td>
                        <td className="py-1.5 text-right" style={{ color: "#3d7a0a" }}>
                          {r.chainTemp != null ? `${r.chainTemp}°C` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Batch Scorecard ── */}
      {batch.status === "COMPLETED" && (
        <BatchScorecard
          yieldPercent={batch.yieldPercent}
          co2Avoided={batch.co2Avoided}
          co2Baseline={batch.co2Baseline}
          durationMinutes={batch.durationMinutes}
          feedstockWeight={batch.feedstockWeight}
          maxReactorTemp={batch.maxReactorTemp}
          incidents={batch.events.filter((e) => e.type === "INCIDENT").length}
          labResults={batch.labResults}
          readings={batch.readings}
        />
      )}

      {/* ── Nova AI Insights ── */}
      <AIInsights batchId={batch.id} />

      {/* ── Process Events Timeline ── */}
      {batch.events.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
          <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
            Eventos del Proceso — {batch.events.length} eventos
          </h3>
          <ProcessTimeline events={batch.events} />
        </div>
      )}

      {/* ── Lab Results ── */}
      {batch.labResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
          <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
            Laboratorio
          </h3>
          {batch.labResults.map((lab) => (
            <div key={lab.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-semibold">{lab.labName}</span>
                  {lab.labCertification && (
                    <span className="text-[10px] text-eco-blue ml-2">
                      {lab.labCertification}
                    </span>
                  )}
                  <p className="text-[10px] text-eco-muted-2">
                    Muestra: {lab.sampleNumber} ·{" "}
                    {new Date(lab.reportDate).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {[
                  {
                    test: "Viscosidad @40°C",
                    value: lab.viscosity40C ? `${lab.viscosity40C} mm²/s` : "—",
                    method: "ASTM D7042",
                  },
                  {
                    test: "Contenido de Agua",
                    value: lab.waterContent ? `${lab.waterContent} PPM` : "—",
                    method: "ASTM D6304",
                  },
                  {
                    test: "% Azufre",
                    value: lab.sulfurPercent
                      ? `${lab.sulfurPercent}% m/m`
                      : "—",
                    method: "ASTM D4951",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded bg-eco-surface-2/50"
                  >
                    <span className="text-xs">{row.test}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-eco-muted-2 font-mono">
                        {row.method}
                      </span>
                      <span className="text-sm font-mono font-bold">
                        {row.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {lab.verdict && (
                <div className="mt-3 text-center py-2.5 bg-eco-green/5 border border-eco-green/10 rounded-lg">
                  <span className="text-eco-green text-sm font-semibold">
                    ✓ {lab.verdict}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── GHG Impact ── */}
      {batch.co2Avoided != null && batch.co2Avoided > 0 && (() => {
        const reductionPct = batch.co2Baseline && batch.co2Project
          ? ((1 - batch.co2Project / batch.co2Baseline) * 100).toFixed(0)
          : "0";
        const baselineWidth = 100;
        const projectWidth = batch.co2Baseline && batch.co2Project
          ? (batch.co2Project / batch.co2Baseline) * 100
          : 10;
        // Equivalences
        const treesEquiv = Math.round(batch.co2Avoided / 22); // 1 tree absorbs ~22 kg CO₂/yr
        const kmEquiv = Math.round(batch.co2Avoided / 0.247); // avg car: 0.247 kg CO₂/km
        const daysElecEquiv = Math.round(batch.co2Avoided / 2.8); // Mexican household: ~2.8 kg CO₂/day

        return (
          <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-6 space-y-6">
            <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
              Impacto Ambiental — Ciclo de Vida
            </h3>

            {/* Tier 1: Hero metric */}
            <div className="text-center py-4">
              <div className="inline-flex items-baseline gap-2">
                <span className="font-mono text-5xl font-semibold tracking-tighter" style={{ color: "#3d7a0a" }}>
                  {batch.co2Avoided.toFixed(1)}
                </span>
                <span className="text-lg text-eco-muted font-mono">kg CO₂eq</span>
              </div>
              <p className="text-sm mt-1.5" style={{ color: "#3d7a0a" }}>
                emisiones evitadas en este lote
              </p>
              <span
                className="inline-block mt-2 font-mono text-xs font-bold px-3 py-1 rounded-full"
                style={{ color: "#3d7a0a", background: "rgba(61,122,10,0.1)" }}
              >
                ↓ {reductionPct}% vs quema a cielo abierto
              </span>
            </div>

            {/* Tier 2: Comparison bars */}
            <div className="space-y-3 px-1">
              {/* Baseline bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-eco-muted uppercase tracking-wider">
                    Sin EcoNova — quema abierta
                  </span>
                  <span className="font-mono text-xs font-bold text-eco-red">
                    {batch.co2Baseline?.toFixed(1)} kg
                  </span>
                </div>
                <div className="h-5 rounded-full bg-eco-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${baselineWidth}%`,
                      background: "linear-gradient(90deg, #DC2626 0%, #ef4444 100%)",
                    }}
                  />
                </div>
              </div>
              {/* Project bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-eco-muted uppercase tracking-wider">
                    Con EcoNova — pirólisis
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color: "#3d7a0a" }}>
                    {batch.co2Project?.toFixed(1)} kg
                  </span>
                </div>
                <div className="h-5 rounded-full bg-eco-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(projectWidth, 3)}%`,
                      background: "linear-gradient(90deg, #3d7a0a 0%, #5a9a1a 100%)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tier 3: Visual equivalences */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-eco-surface-2/60 rounded-xl">
                <div className="text-2xl mb-1">🌳</div>
                <div className="font-mono text-lg font-bold text-eco-ink">
                  {treesEquiv}
                </div>
                <div className="text-[10px] text-eco-muted leading-tight mt-0.5">
                  árboles absorbiendo<br />CO₂ por 1 año
                </div>
              </div>
              <div className="text-center p-4 bg-eco-surface-2/60 rounded-xl">
                <div className="text-2xl mb-1">🚗</div>
                <div className="font-mono text-lg font-bold text-eco-ink">
                  {kmEquiv.toLocaleString()}
                </div>
                <div className="text-[10px] text-eco-muted leading-tight mt-0.5">
                  km sin recorrer<br />en automóvil
                </div>
              </div>
              <div className="text-center p-4 bg-eco-surface-2/60 rounded-xl">
                <div className="text-2xl mb-1">💡</div>
                <div className="font-mono text-lg font-bold text-eco-ink">
                  {daysElecEquiv}
                </div>
                <div className="text-[10px] text-eco-muted leading-tight mt-0.5">
                  días de electricidad<br />de un hogar mexicano
                </div>
              </div>
            </div>

            {/* Methodology note */}
            <p className="text-[10px] text-eco-muted-2 italic leading-relaxed border-t border-eco-border pt-3">
              Metodología IPCC 2006 · Baseline: quema a cielo abierto · Incluye combustión eventual como combustible ·
              Consumo energético estimado — requiere medición real
            </p>
          </div>
        );
      })()}

      {/* ── Operators & Notes ── */}
      <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div>
            <span className="text-eco-muted text-xs">Operadores: </span>
            <span>{batch.operators.join(", ")}</span>
          </div>
          {batch.durationMinutes != null && (
            <div>
              <span className="text-eco-muted text-xs">Duración: </span>
              <span className="font-mono">
                {Math.floor(batch.durationMinutes / 60)}h{" "}
                {batch.durationMinutes % 60}m
              </span>
            </div>
          )}
        </div>
        {batch.notes && (
          <p className="mt-2 text-xs text-eco-muted italic">{batch.notes}</p>
        )}
      </div>
    </div>
  );
}
