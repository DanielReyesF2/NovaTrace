"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
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
    oilWeightKg: number | null;
    yieldPercent: number | null;
    durationMinutes: number | null;
    maxReactorTemp: number | null;
    dieselConsumedL: number | null;
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
    photos: Array<{
      id: string;
      url: string;
      type: string;
      caption: string | null;
      takenAt: string;
    }>;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: "Completado", color: "#3d7a0a", bg: "rgba(181,233,81,0.2)" },
  IN_PROGRESS: { label: "En proceso", color: "#2D8CF0", bg: "rgba(45,140,240,0.1)" },
  INCOMPLETE: { label: "Incompleto", color: "#E8700A", bg: "rgba(232,112,10,0.1)" },
  FAILED: { label: "Fallido", color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

const PHOTO_TYPE_COLORS: Record<string, string> = {
  FEEDSTOCK: "#E8700A",
  PROCESS: "#2D8CF0",
  PRODUCT: "#3d7a0a",
  LABEL: "#7C5CFC",
};

export function BatchDetail({ batch }: BatchDetailProps) {
  const [showRawData, setShowRawData] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
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
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-eco-muted font-light">
            {new Date(batch.date).toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* ── Traceability Passport ── */}
      <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
        <div className="flex items-stretch">
          {/* Left — info */}
          <div className="flex-1 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #273949, #3d7a0a)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4" />
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                </svg>
              </div>
              <span className="text-[9px] uppercase tracking-[3px] text-eco-muted font-semibold">
                Pasaporte de Trazabilidad
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-eco-muted">Lote</span>
                <span className="font-mono font-bold text-eco-ink">{batch.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-eco-muted">Fecha</span>
                <span className="font-mono text-eco-ink">
                  {new Date(batch.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-eco-muted">Origen</span>
                <span className="text-eco-ink">{batch.feedstockOrigin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-eco-muted">Material</span>
                <span className="text-eco-ink">{batch.feedstockType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-eco-muted">Peso</span>
                <span className="font-mono font-bold text-eco-ink">{batch.feedstockWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-eco-muted">Estado</span>
                <span className="font-semibold" style={{ color: status.color }}>{status.label}</span>
              </div>
            </div>
            {batch.certificates.length > 0 && (
              <div className="mt-2 pt-2 border-t border-eco-border">
                <span className="text-[8px] font-mono text-eco-muted-2">
                  CERT {batch.certificates[0].code} · SHA-256: {batch.certificates[0].hash.slice(0, 12)}…
                </span>
              </div>
            )}
          </div>
          {/* Right — QR */}
          <div className="flex flex-col items-center justify-center px-5 py-4 bg-eco-surface-2/30 border-l border-eco-border min-w-[140px]">
            <QRCodeSVG
              value={
                batch.certificates.length > 0
                  ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${batch.certificates[0].code}`
                  : `${typeof window !== "undefined" ? window.location.origin : ""}/batch/${batch.id}`
              }
              size={88}
              level="M"
              bgColor="transparent"
              fgColor="#273949"
            />
            <span className="text-[7px] text-eco-muted-2 font-mono mt-2 text-center leading-tight">
              {batch.certificates.length > 0 ? "Verificar certificado" : "Trazabilidad EcoNova"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-eco-border rounded-xl overflow-hidden">
        {[
          { label: "Feedstock", value: `${batch.feedstockWeight} kg`, color: "#273949" },
          {
            label: "Aceite",
            value: batch.oilOutput != null && batch.oilOutput > 0 ? `${batch.oilOutput} L` : "—",
            color: "#7C5CFC",
          },
          {
            label: "Temp máx",
            value: batch.maxReactorTemp != null ? `${batch.maxReactorTemp}°C` : "—",
            color: "#E8700A",
          },
          {
            label: "Duración",
            value: batch.durationMinutes != null ? formatDuration(batch.durationMinutes) : "—",
            color: "#273949",
          },
          {
            label: "Diésel",
            value: batch.dieselConsumedL != null ? `${batch.dieselConsumedL} L` : "—",
            color: "#2D8CF0",
          },
          {
            label: "Operadores",
            value: batch.operators.join(", "),
            color: "#273949",
            small: true,
          },
        ].map((s, i) => (
          <div key={i} className="bg-white p-3.5 text-center">
            <div
              className={`font-mono font-bold tracking-tight ${s.small ? "text-xs" : "text-lg"}`}
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-[8px] text-eco-muted uppercase tracking-wider mt-1 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Stop reason (if any) ── */}
      {batch.stopReason && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-eco-red/[0.03] border border-eco-red/10">
          <span className="text-eco-red text-xs mt-0.5">⚠</span>
          <div>
            <span className="text-[10px] text-eco-red font-semibold uppercase tracking-wider">
              Razón de paro
            </span>
            <p className="text-xs text-eco-ink-light leading-relaxed mt-0.5">
              {batch.stopReason}
            </p>
          </div>
        </div>
      )}

      {/* ── Feedstock + Photos (side by side) ── */}
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
                <span className="text-eco-ink-light text-xs text-right max-w-[60%]">
                  {batch.feedstockCondition}
                </span>
              </div>
            )}
            {batch.yieldPercent != null && (
              <div className="flex justify-between pt-2 border-t border-eco-border">
                <span className="text-eco-muted">Rendimiento</span>
                <span className="font-mono font-bold">{batch.yieldPercent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Photos grid 2×2 */}
        {batch.photos.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
            <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-3">
              Registro Fotográfico
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {batch.photos.slice(0, 4).map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setLightboxIdx(idx)}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-eco-surface-2 hover:shadow-md transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "Foto"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {photo.caption && (
                    <span className="absolute bottom-1.5 left-2 right-2 text-[8px] text-white leading-tight line-clamp-1 font-medium">
                      {photo.caption}
                    </span>
                  )}
                  <span
                    className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: PHOTO_TYPE_COLORS[photo.type] || "#273949" }}
                  />
                </button>
              ))}
            </div>
            {batch.photos.length > 4 && (
              <p className="text-[9px] text-eco-muted text-center mt-2">
                +{batch.photos.length - 4} fotos más
              </p>
            )}
          </div>
        ) : (
          /* Empty state — Operación data if no photos */
          <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
            <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-3">
              Operación
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-eco-muted">Operadores</span>
                <span>{batch.operators.join(", ")}</span>
              </div>
              {batch.durationMinutes != null && (
                <div className="flex justify-between">
                  <span className="text-eco-muted">Duración</span>
                  <span className="font-mono">{formatDuration(batch.durationMinutes)}</span>
                </div>
              )}
              {batch.dieselConsumedL != null && (
                <div className="flex justify-between">
                  <span className="text-eco-muted">Diésel consumido</span>
                  <span className="font-mono">{batch.dieselConsumedL} L</span>
                </div>
              )}
            </div>
          </div>
        )}
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
                      <th className="py-2 text-right">Sup. Reactor</th>
                      <th className="py-2 text-right">Termopar</th>
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

      {/* ── Process Events Timeline ── */}
      {batch.events.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
          <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
            Eventos del Proceso — {batch.events.length} eventos
          </h3>
          <ProcessTimeline events={batch.events} readings={batch.readings} />
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
                    value: lab.sulfurPercent ? `${lab.sulfurPercent}% m/m` : "—",
                    method: "ASTM D4951",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded bg-eco-surface-2/50"
                  >
                    <span className="text-xs">{row.test}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-eco-muted-2 font-mono">{row.method}</span>
                      <span className="text-sm font-mono font-bold">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              {lab.verdict && (
                <div className="mt-3 text-center py-2.5 bg-eco-green/5 border border-eco-green/10 rounded-lg">
                  <span className="text-eco-green text-sm font-semibold">✓ {lab.verdict}</span>
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
        const treesEquiv = Math.round(batch.co2Avoided / 22);
        const kmEquiv = Math.round(batch.co2Avoided / 0.247);
        const daysElecEquiv = Math.round(batch.co2Avoided / 2.8);

        return (
          <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-6 space-y-6">
            <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
              Impacto Ambiental — Ciclo de Vida
            </h3>
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
            <div className="space-y-3 px-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-eco-muted uppercase tracking-wider">Sin EcoNova — quema abierta</span>
                  <span className="font-mono text-xs font-bold text-eco-red">{batch.co2Baseline?.toFixed(1)} kg</span>
                </div>
                <div className="h-5 rounded-full bg-eco-surface-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${baselineWidth}%`, background: "linear-gradient(90deg, #DC2626, #ef4444)" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-eco-muted uppercase tracking-wider">Con EcoNova — pirólisis</span>
                  <span className="font-mono text-xs font-bold" style={{ color: "#3d7a0a" }}>{batch.co2Project?.toFixed(1)} kg</span>
                </div>
                <div className="h-5 rounded-full bg-eco-surface-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(projectWidth, 3)}%`, background: "linear-gradient(90deg, #3d7a0a, #5a9a1a)" }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: "🌳", value: treesEquiv, label: "árboles absorbiendo\nCO₂ por 1 año" },
                { emoji: "🚗", value: kmEquiv.toLocaleString(), label: "km sin recorrer\nen automóvil" },
                { emoji: "💡", value: daysElecEquiv, label: "días de electricidad\nde un hogar mexicano" },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-eco-surface-2/60 rounded-xl">
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="font-mono text-lg font-bold text-eco-ink">{item.value}</div>
                  <div className="text-[10px] text-eco-muted leading-tight mt-0.5 whitespace-pre-line">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-eco-muted-2 italic leading-relaxed border-t border-eco-border pt-3">
              Metodología IPCC 2006 · Baseline: quema a cielo abierto · Incluye combustión eventual como combustible ·
              Consumo energético estimado — requiere medición real
            </p>
          </div>
        );
      })()}

      {/* ── Nova AI Floating Widget ── */}
      <AIInsights batchId={batch.id} />

      {/* ── Photo Lightbox ── */}
      {lightboxIdx !== null && batch.photos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] rounded-2xl overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={batch.photos[lightboxIdx].url}
              alt={batch.photos[lightboxIdx].caption || "Foto"}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 flex items-center justify-between">
              <div>
                {batch.photos[lightboxIdx].caption && (
                  <p className="text-sm text-eco-ink font-medium">
                    {batch.photos[lightboxIdx].caption}
                  </p>
                )}
                <p className="text-[10px] text-eco-muted font-mono mt-0.5">
                  {batch.photos[lightboxIdx].type} · {lightboxIdx + 1}/{batch.photos.length}
                </p>
              </div>
              <button
                onClick={() => setLightboxIdx(null)}
                className="text-eco-muted hover:text-eco-ink text-xl px-3 py-1 rounded-lg hover:bg-eco-surface-2 transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Navigate */}
            {lightboxIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-lg"
              >
                ‹
              </button>
            )}
            {lightboxIdx < batch.photos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-lg"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
