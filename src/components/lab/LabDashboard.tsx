"use client";

import Link from "next/link";
import { NovaLabAnalysis } from "./NovaLabAnalysis";

/* ── Types ── */
interface LabResultFull {
  id: string;
  batchId: string;
  labName: string;
  labCertification: string | null;
  sampleNumber: string;
  lotNumber: string | null;
  reportDate: string;
  productClassification: string | null;

  // Lab 1 style
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

  // Lab 2 style
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

interface LabDashboardProps {
  labResults: LabResultFull[];
  stats: {
    totalLabs: number;
    uniqueLabs: number;
    batchesWithLab: number;
  };
}

/* ── Helpers ── */
const PRODUCT_STYLES: Record<string, { color: string; bg: string; accent: string }> = {
  "Aceite pirolítico": { color: "#7C5CFC", bg: "rgba(124,92,252,0.06)", accent: "rgba(124,92,252,0.12)" },
  Solvente: { color: "#E8700A", bg: "rgba(232,112,10,0.06)", accent: "rgba(232,112,10,0.12)" },
  "Combustible alterno": { color: "#2D8CF0", bg: "rgba(45,140,240,0.06)", accent: "rgba(45,140,240,0.12)" },
};

function getStyle(classification: string | null) {
  if (!classification) return { color: "#273949", bg: "rgba(39,57,73,0.04)", accent: "rgba(39,57,73,0.08)" };
  return PRODUCT_STYLES[classification] || { color: "#273949", bg: "rgba(39,57,73,0.04)", accent: "rgba(39,57,73,0.08)" };
}

/* ── Unified row extractor ── */
type Row = { label: string; value: string; method: string; warning?: boolean };

function extractRows(lr: LabResultFull): Row[] {
  const rows: Row[] = [];
  if (lr.density15C != null) rows.push({ label: "Densidad @15°C", value: `${lr.density15C} g/mL`, method: "ASTM D4052" });
  if (lr.density20C != null) rows.push({ label: "Densidad @20°C", value: `${lr.density20C} Kg/L`, method: "ASTM D1298" });
  if (lr.viscosity40C != null) rows.push({ label: "Viscosidad @40°C", value: `${lr.viscosity40C} mm²/s`, method: "ASTM D7042" });
  if (lr.viscDynamic20C != null) rows.push({ label: "Visc. Dinámica @20°C", value: `${lr.viscDynamic20C} cP`, method: "ASTM D2983" });
  if (lr.flashPoint != null) rows.push({ label: "Pto. Inflam. (cerrada)", value: `${lr.flashPoint}°C`, method: "ASTM D93" });
  if (lr.flashPointOpen != null) rows.push({ label: "Pto. Inflam. (abierta)", value: lr.flashPointOpen <= 5 ? "<5°C" : `${lr.flashPointOpen}°C`, method: "ASTM D92", warning: lr.flashPointOpen <= 5 });
  if (lr.calorificMJ != null) rows.push({ label: "Poder Calorífico", value: `${lr.calorificMJ} MJ/kg`, method: "ASTM D240" });
  if (lr.calorificCalG != null) rows.push({ label: "Poder Calorífico", value: `${lr.calorificCalG.toLocaleString()} Cal/g`, method: "ASTM D240" });
  if (lr.waterContent != null) rows.push({ label: "Contenido de Agua", value: `${lr.waterContent} PPM`, method: "ASTM D6304" });
  if (lr.waterByKFPct != null) rows.push({ label: "Agua (Karl Fischer)", value: `${lr.waterByKFPct}%`, method: "ASTM E203" });
  if (lr.waterSedimentPct != null) rows.push({ label: "Agua y Sedimento", value: `${lr.waterSedimentPct}%`, method: "ASTM D4007" });
  if (lr.sulfurPercent != null) rows.push({ label: "Azufre", value: `${lr.sulfurPercent}% m/m`, method: "ASTM D4951" });
  if (lr.carbonResidue != null) rows.push({ label: "Residuo Carbón", value: `${lr.carbonResidue}%`, method: "ASTM D4530" });
  if (lr.ashContent != null) rows.push({ label: "Cenizas", value: `${lr.ashContent}%`, method: "ASTM D482" });
  return rows;
}

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */
export function LabDashboard({ labResults, stats }: LabDashboardProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-eco-ink">Laboratorio</h1>
        <p className="text-xs text-eco-muted mt-1">
          Resultados de análisis de calidad — {stats.totalLabs} muestras · {stats.uniqueLabs} laboratorios
        </p>
      </div>

      {/* ── Side-by-side comparison cards ── */}
      {labResults.length >= 2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {labResults.map((lr) => (
            <LabCard key={lr.id} lr={lr} />
          ))}
        </div>
      ) : labResults.length === 1 ? (
        <div className="max-w-lg">
          <LabCard lr={labResults[0]} />
        </div>
      ) : (
        <div className="text-center py-16 text-eco-muted-2">
          <div className="text-3xl mb-2">🧪</div>
          <p className="text-sm">No hay resultados de laboratorio</p>
        </div>
      )}

      {/* ── Nova AI Analysis ── */}
      {labResults.length >= 2 && (
        <NovaLabAnalysis />
      )}

      {/* ── Comparison table (parameters aligned) ── */}
      {labResults.length >= 2 && <ComparisonTable results={labResults} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   LAB CARD — vertical card for each result
   ══════════════════════════════════════════════ */
function LabCard({ lr }: { lr: LabResultFull }) {
  const style = getStyle(lr.productClassification);
  const rows = extractRows(lr);

  return (
    <div
      className="bg-white rounded-2xl shadow-soft border overflow-hidden transition-all hover:shadow-md"
      style={{ borderColor: `${style.color}20` }}
    >
      {/* ── Card header with color accent ── */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ background: `linear-gradient(135deg, ${style.bg}, transparent)` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Product classification badge */}
            {lr.productClassification && (
              <span
                className="inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                style={{ color: style.color, background: style.accent }}
              >
                {lr.productClassification}
              </span>
            )}
            <h3 className="text-sm font-semibold text-eco-ink leading-snug">{lr.labName}</h3>
            {lr.labCertification && (
              <p className="text-[9px] text-eco-blue font-mono mt-0.5">{lr.labCertification}</p>
            )}
          </div>
          {/* Batch link */}
          <Link
            href={`/batch/${lr.batch.id}`}
            className="text-[9px] font-mono px-2.5 py-1 rounded-lg bg-white/80 text-eco-muted hover:text-eco-blue border border-eco-border/50 hover:border-eco-blue/30 transition-colors flex-shrink-0"
          >
            {lr.batch.code}
          </Link>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 text-[10px] text-eco-muted">
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            {new Date(lr.reportDate).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="font-mono">Folio: {lr.sampleNumber}</span>
          {lr.analystName && <span className="hidden sm:inline">{lr.analystName}</span>}
        </div>
      </div>

      {/* ── Qualitative properties ── */}
      {(lr.appearance || lr.color || lr.crepitation) && (
        <div className="px-5 py-3 border-t border-eco-border/30 flex gap-2 flex-wrap">
          {lr.appearance && (
            <span className="text-[9px] px-2.5 py-1 rounded-full bg-eco-surface-2 text-eco-ink font-medium">
              {lr.appearance}
            </span>
          )}
          {lr.color && (
            <span className="text-[9px] px-2.5 py-1 rounded-full bg-eco-surface-2 text-eco-muted">
              Color: {lr.color}
            </span>
          )}
          {lr.crepitation && (
            <span className="text-[9px] px-2.5 py-1 rounded-full bg-eco-surface-2 text-eco-muted">
              Crepitación: {lr.crepitation}
            </span>
          )}
        </div>
      )}

      {/* ── Test results ── */}
      <div className="px-5 py-4 space-y-1">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-2.5 px-3.5 rounded-lg transition-colors ${
              row.warning
                ? "bg-red-50/60 border border-red-200/30"
                : i % 2 === 0
                  ? "bg-eco-surface-2/40"
                  : "bg-white"
            }`}
          >
            <div>
              <div className={`text-xs font-medium ${row.warning ? "text-eco-red" : "text-eco-ink"}`}>
                {row.label}
              </div>
              <div className="text-[7px] text-eco-muted-2 font-mono mt-0.5">{row.method}</div>
            </div>
            <div
              className={`font-mono text-base font-bold tabular-nums ${
                row.warning ? "text-eco-red" : "text-eco-ink"
              }`}
              style={!row.warning ? { color: style.color } : undefined}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Notes ── */}
      {lr.labNotes && (
        <div className="mx-5 mb-4 px-3.5 py-2.5 bg-amber-50/60 border border-amber-200/30 rounded-lg">
          <p className="text-[10px] text-amber-800 italic leading-relaxed">{lr.labNotes}</p>
        </div>
      )}

      {/* ── Verdict footer ── */}
      {lr.verdict && (
        <div
          className="px-5 py-3.5 border-t text-center"
          style={{ borderColor: `${style.color}15`, background: `${style.color}06` }}
        >
          <span className="text-xs font-semibold" style={{ color: style.color }}>
            ✓ {lr.verdict}
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPARISON TABLE — aligned parameters
   ══════════════════════════════════════════════ */
function ComparisonTable({ results }: { results: LabResultFull[] }) {
  type Param = {
    key: string;
    label: string;
    method?: string;
    unit?: string;
    extract: (lr: LabResultFull) => string | null;
    numericExtract?: (lr: LabResultFull) => number | null;
    warning?: (lr: LabResultFull) => boolean;
  };

  const params: Param[] = [
    {
      key: "density",
      label: "Densidad",
      extract: (lr) => {
        if (lr.density15C != null) return `${lr.density15C} g/mL @15°C`;
        if (lr.density20C != null) return `${lr.density20C} Kg/L @20°C`;
        return null;
      },
      numericExtract: (lr) => lr.density15C ?? lr.density20C,
    },
    {
      key: "viscosity",
      label: "Viscosidad",
      extract: (lr) => {
        if (lr.viscosity40C != null) return `${lr.viscosity40C} mm²/s @40°C`;
        if (lr.viscDynamic20C != null) return `${lr.viscDynamic20C} cP @20°C`;
        return null;
      },
      numericExtract: (lr) => lr.viscosity40C ?? lr.viscDynamic20C,
    },
    {
      key: "flashpoint",
      label: "Pto. Inflamación",
      extract: (lr) => {
        if (lr.flashPoint != null) return `${lr.flashPoint}°C (cerrada)`;
        if (lr.flashPointOpen != null) return lr.flashPointOpen <= 5 ? "<5°C (abierta)" : `${lr.flashPointOpen}°C (abierta)`;
        return null;
      },
      numericExtract: (lr) => lr.flashPoint ?? lr.flashPointOpen,
      warning: (lr) => (lr.flashPointOpen != null && lr.flashPointOpen <= 5),
    },
    {
      key: "calorific",
      label: "Poder Calorífico",
      extract: (lr) => {
        if (lr.calorificMJ != null) return `${lr.calorificMJ} MJ/kg`;
        if (lr.calorificCalG != null) return `${lr.calorificCalG.toLocaleString()} Cal/g`;
        return null;
      },
    },
    {
      key: "water",
      label: "Agua",
      extract: (lr) => {
        if (lr.waterContent != null) return `${lr.waterContent} PPM`;
        if (lr.waterByKFPct != null) return `${lr.waterByKFPct}%`;
        return null;
      },
    },
    {
      key: "sediment",
      label: "Agua y Sedimento",
      method: "ASTM D4007",
      extract: (lr) => lr.waterSedimentPct != null ? `${lr.waterSedimentPct}%` : null,
    },
    {
      key: "sulfur",
      label: "Azufre",
      method: "ASTM D4951",
      extract: (lr) => lr.sulfurPercent != null ? `${lr.sulfurPercent}% m/m` : null,
    },
    {
      key: "carbon",
      label: "Residuo Carbón",
      method: "ASTM D4530",
      extract: (lr) => lr.carbonResidue != null ? `${lr.carbonResidue}%` : null,
    },
    {
      key: "ash",
      label: "Cenizas",
      method: "ASTM D482",
      extract: (lr) => lr.ashContent != null ? `${lr.ashContent}%` : null,
    },
  ];

  const activeParams = params.filter((p) => results.some((lr) => p.extract(lr) != null));

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
      <div className="px-5 py-4 border-b border-eco-border flex items-center justify-between">
        <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
          Comparación Directa
        </h3>
        <div className="flex gap-3">
          {results.map((lr) => {
            const s = getStyle(lr.productClassification);
            return (
              <span
                key={lr.id}
                className="text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ color: s.color, background: s.accent }}
              >
                {lr.productClassification || lr.labName}
              </span>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-eco-border/30">
        {activeParams.map((param, idx) => (
          <div key={param.key} className={`grid grid-cols-[1fr_1fr_1fr] ${idx % 2 === 0 ? "bg-eco-surface-2/15" : ""}`}>
            {/* Parameter label */}
            <div className="px-5 py-3.5 flex flex-col justify-center border-r border-eco-border/20">
              <span className="text-xs font-semibold text-eco-ink">{param.label}</span>
              {param.method && (
                <span className="text-[7px] text-eco-muted-2 font-mono mt-0.5">{param.method}</span>
              )}
            </div>
            {/* Values */}
            {results.map((lr) => {
              const val = param.extract(lr);
              const isWarning = param.warning?.(lr);
              const s = getStyle(lr.productClassification);
              return (
                <div
                  key={lr.id}
                  className={`px-4 py-3.5 flex items-center justify-center ${
                    isWarning ? "bg-red-50/40" : ""
                  }`}
                >
                  {val != null ? (
                    <span
                      className={`font-mono text-sm font-bold tabular-nums text-center ${
                        isWarning ? "text-eco-red" : ""
                      }`}
                      style={!isWarning ? { color: s.color } : undefined}
                    >
                      {val}
                    </span>
                  ) : (
                    <span className="text-eco-muted-2 text-xs">—</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Verdict row */}
        <div className="grid grid-cols-[1fr_1fr_1fr] bg-eco-surface-2/30">
          <div className="px-5 py-4 flex items-center border-r border-eco-border/20">
            <span className="text-xs font-bold text-eco-muted uppercase tracking-wider">Dictamen</span>
          </div>
          {results.map((lr) => {
            const s = getStyle(lr.productClassification);
            return (
              <div key={lr.id} className="px-4 py-4 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-center leading-snug" style={{ color: s.color }}>
                  {lr.verdict || "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
