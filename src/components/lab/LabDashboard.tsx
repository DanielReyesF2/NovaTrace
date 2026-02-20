"use client";

import { useState } from "react";
import Link from "next/link";

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
const PRODUCT_COLORS: Record<string, { color: string; bg: string }> = {
  "Aceite pirolítico": { color: "#7C5CFC", bg: "rgba(124,92,252,0.08)" },
  Solvente: { color: "#E8700A", bg: "rgba(232,112,10,0.08)" },
  "Combustible alterno": { color: "#2D8CF0", bg: "rgba(45,140,240,0.08)" },
};

function getProductStyle(classification: string | null) {
  if (!classification) return { color: "#273949", bg: "rgba(39,57,73,0.06)" };
  return PRODUCT_COLORS[classification] || { color: "#273949", bg: "rgba(39,57,73,0.06)" };
}

/* ── Component ── */
export function LabDashboard({ labResults, stats }: LabDashboardProps) {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Group by batch
  const batchGroups = new Map<string, { code: string; results: LabResultFull[] }>();
  for (const lr of labResults) {
    const existing = batchGroups.get(lr.batchId);
    if (existing) {
      existing.results.push(lr);
    } else {
      batchGroups.set(lr.batchId, { code: lr.batch.code, results: [lr] });
    }
  }

  // Filter
  const filtered =
    selectedBatch === "all"
      ? labResults
      : labResults.filter((lr) => lr.batchId === selectedBatch);

  // Compare selection
  const toggleCompare = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id); // max 4
      return next;
    });
  };

  const compareResults = labResults.filter((lr) => selectedIds.has(lr.id));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-eco-ink">Laboratorio</h1>
          <p className="text-xs text-eco-muted mt-1">
            Resultados de análisis de calidad — {stats.totalLabs} muestras de{" "}
            {stats.uniqueLabs} laboratorios
          </p>
        </div>
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedIds(new Set());
          }}
          className={`text-[11px] font-semibold px-4 py-2 rounded-xl border transition-colors ${
            compareMode
              ? "bg-eco-navy text-white border-eco-navy"
              : "bg-white text-eco-muted border-eco-border hover:border-eco-border-strong"
          }`}
        >
          {compareMode ? "✕ Salir de comparación" : "⇆ Comparar resultados"}
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-px bg-eco-border rounded-xl overflow-hidden">
        {[
          { label: "Muestras analizadas", value: stats.totalLabs, color: "#2D8CF0" },
          { label: "Laboratorios", value: stats.uniqueLabs, color: "#7C5CFC" },
          { label: "Lotes con análisis", value: stats.batchesWithLab, color: "#3d7a0a" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 text-center">
            <div className="font-mono text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[8px] text-eco-muted uppercase tracking-wider mt-1 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Batch filter ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-eco-muted uppercase tracking-wider font-medium">
          Filtrar:
        </span>
        <button
          onClick={() => setSelectedBatch("all")}
          className={`text-[10px] font-mono px-3 py-1.5 rounded-full transition-colors ${
            selectedBatch === "all"
              ? "bg-eco-navy text-white"
              : "bg-eco-surface-2 text-eco-muted hover:text-eco-ink"
          }`}
        >
          Todos
        </button>
        {Array.from(batchGroups.entries()).map(([batchId, { code, results }]) => (
          <button
            key={batchId}
            onClick={() => setSelectedBatch(batchId)}
            className={`text-[10px] font-mono px-3 py-1.5 rounded-full transition-colors ${
              selectedBatch === batchId
                ? "bg-eco-navy text-white"
                : "bg-eco-surface-2 text-eco-muted hover:text-eco-ink"
            }`}
          >
            {code} ({results.length})
          </button>
        ))}
      </div>

      {/* ── Compare View ── */}
      {compareMode && compareResults.length >= 2 && (
        <CompareTable results={compareResults} />
      )}
      {compareMode && compareResults.length < 2 && (
        <div className="bg-eco-surface-2/50 rounded-xl p-6 text-center">
          <p className="text-sm text-eco-muted">
            Selecciona al menos <strong>2 muestras</strong> para comparar (máx. 4)
          </p>
          <p className="text-[10px] text-eco-muted-2 mt-1">
            {selectedIds.size}/4 seleccionadas
          </p>
        </div>
      )}

      {/* ── Results list ── */}
      <div className="space-y-4">
        {filtered.map((lr) => {
          const productStyle = getProductStyle(lr.productClassification);
          const isSelected = selectedIds.has(lr.id);

          return (
            <div
              key={lr.id}
              className={`bg-white rounded-2xl shadow-soft border p-5 transition-all ${
                compareMode && isSelected
                  ? "border-eco-navy/30 ring-2 ring-eco-navy/10"
                  : "border-black/[0.03]"
              } ${compareMode ? "cursor-pointer" : ""}`}
              onClick={() => compareMode && toggleCompare(lr.id)}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    {compareMode && (
                      <span
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-[10px] flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-eco-navy border-eco-navy text-white"
                            : "border-eco-border bg-white"
                        }`}
                      >
                        {isSelected && "✓"}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-eco-ink">{lr.labName}</span>
                    {lr.labCertification && (
                      <span className="text-[9px] text-eco-blue font-mono">
                        {lr.labCertification}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-eco-muted">
                    <span>Muestra: {lr.sampleNumber}</span>
                    <span>
                      {new Date(lr.reportDate).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {lr.analystName && <span>{lr.analystName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {lr.productClassification && (
                    <span
                      className="text-[9px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: productStyle.color, background: productStyle.bg }}
                    >
                      {lr.productClassification}
                    </span>
                  )}
                  <Link
                    href={`/batch/${lr.batch.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] font-mono text-eco-blue hover:underline px-2 py-1 rounded bg-eco-surface-2"
                  >
                    {lr.batch.code}
                  </Link>
                </div>
              </div>

              {/* Results grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {/* Lab 1 style fields */}
                {lr.density15C != null && (
                  <ResultCell label="Densidad 15°C" value={`${lr.density15C} g/mL`} method="ASTM D4052" />
                )}
                {lr.density20C != null && (
                  <ResultCell label="Densidad 20°C" value={`${lr.density20C} Kg/L`} method="ASTM D1298" />
                )}
                {lr.viscosity40C != null && (
                  <ResultCell label="Viscosidad 40°C" value={`${lr.viscosity40C} mm²/s`} method="ASTM D7042" />
                )}
                {lr.viscDynamic20C != null && (
                  <ResultCell label="Visc. Dinámica 20°C" value={`${lr.viscDynamic20C} cP`} method="ASTM D2983" />
                )}
                {lr.flashPoint != null && (
                  <ResultCell label="Punto Inflam. (cerrada)" value={`${lr.flashPoint}°C`} method="ASTM D93" />
                )}
                {lr.flashPointOpen != null && (
                  <ResultCell
                    label="Punto Inflam. (abierta)"
                    value={lr.flashPointOpen <= 5 ? "<5°C" : `${lr.flashPointOpen}°C`}
                    method="ASTM D92"
                    warning={lr.flashPointOpen <= 5}
                  />
                )}
                {lr.calorificMJ != null && (
                  <ResultCell label="Poder Calorífico" value={`${lr.calorificMJ} MJ/kg`} method="ASTM D240" />
                )}
                {lr.calorificCalG != null && (
                  <ResultCell label="Poder Calorífico" value={`${lr.calorificCalG.toLocaleString()} Cal/g`} method="ASTM D240" />
                )}
                {lr.waterContent != null && (
                  <ResultCell label="Contenido de Agua" value={`${lr.waterContent} PPM`} method="ASTM D6304" />
                )}
                {lr.waterByKFPct != null && (
                  <ResultCell label="Agua (Karl Fischer)" value={`${lr.waterByKFPct}%`} method="ASTM E203" />
                )}
                {lr.waterSedimentPct != null && (
                  <ResultCell label="Agua y Sedimento" value={`${lr.waterSedimentPct}%`} method="ASTM D4007" />
                )}
                {lr.sulfurPercent != null && (
                  <ResultCell label="Azufre" value={`${lr.sulfurPercent}% m/m`} method="ASTM D4951" />
                )}
                {lr.carbonResidue != null && (
                  <ResultCell label="Residuo Carbón" value={`${lr.carbonResidue}%`} method="ASTM D4530" />
                )}
                {lr.ashContent != null && (
                  <ResultCell label="Cenizas" value={`${lr.ashContent}%`} method="ASTM D482" />
                )}
                {lr.crepitation != null && (
                  <ResultCell label="Crepitación" value={lr.crepitation} />
                )}
                {lr.appearance != null && (
                  <ResultCell label="Apariencia" value={lr.appearance} />
                )}
                {lr.color != null && (
                  <ResultCell label="Color" value={lr.color} />
                )}
              </div>

              {/* Verdict + notes */}
              {(lr.verdict || lr.labNotes) && (
                <div className="mt-3 pt-3 border-t border-eco-border/50 space-y-1.5">
                  {lr.verdict && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-eco-muted uppercase tracking-wider">
                        Dictamen:
                      </span>
                      <span className="text-xs text-eco-ink">{lr.verdict}</span>
                    </div>
                  )}
                  {lr.labNotes && (
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-semibold text-eco-muted uppercase tracking-wider flex-shrink-0">
                        Notas:
                      </span>
                      <span className="text-xs text-eco-ink-light italic">{lr.labNotes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-eco-muted-2">
          <div className="text-3xl mb-2">🧪</div>
          <p className="text-sm">No hay resultados de laboratorio</p>
        </div>
      )}
    </div>
  );
}

/* ── Result Cell ── */
function ResultCell({
  label,
  value,
  method,
  warning,
}: {
  label: string;
  value: string;
  method?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`px-3 py-2.5 rounded-lg ${
        warning ? "bg-red-50/50 border border-red-200/40" : "bg-eco-surface-2/50"
      }`}
    >
      <div className="text-[8px] text-eco-muted uppercase tracking-wider font-medium mb-0.5">
        {label}
      </div>
      <div
        className={`font-mono text-sm font-bold ${
          warning ? "text-eco-red" : "text-eco-ink"
        }`}
      >
        {value}
      </div>
      {method && (
        <div className="text-[7px] text-eco-muted-2 font-mono mt-0.5">{method}</div>
      )}
    </div>
  );
}

/* ── Compare Table ── */
function CompareTable({ results }: { results: LabResultFull[] }) {
  // Collect all available parameters
  type Param = {
    key: string;
    label: string;
    method?: string;
    extract: (lr: LabResultFull) => string | null;
  };

  const params: Param[] = [
    { key: "product", label: "Clasificación", extract: (lr) => lr.productClassification },
    { key: "d15", label: "Densidad 15°C", method: "ASTM D4052", extract: (lr) => lr.density15C != null ? `${lr.density15C} g/mL` : null },
    { key: "d20", label: "Densidad 20°C", method: "ASTM D1298", extract: (lr) => lr.density20C != null ? `${lr.density20C} Kg/L` : null },
    { key: "v40", label: "Viscosidad 40°C", method: "ASTM D7042", extract: (lr) => lr.viscosity40C != null ? `${lr.viscosity40C} mm²/s` : null },
    { key: "vd20", label: "Visc. Dinámica 20°C", method: "ASTM D2983", extract: (lr) => lr.viscDynamic20C != null ? `${lr.viscDynamic20C} cP` : null },
    { key: "fp", label: "Pto. Inflam. (cerrada)", method: "ASTM D93", extract: (lr) => lr.flashPoint != null ? `${lr.flashPoint}°C` : null },
    { key: "fpo", label: "Pto. Inflam. (abierta)", method: "ASTM D92", extract: (lr) => lr.flashPointOpen != null ? (lr.flashPointOpen <= 5 ? "<5°C" : `${lr.flashPointOpen}°C`) : null },
    { key: "cal", label: "Poder Calorífico", method: "ASTM D240", extract: (lr) => {
      if (lr.calorificMJ != null) return `${lr.calorificMJ} MJ/kg`;
      if (lr.calorificCalG != null) return `${lr.calorificCalG.toLocaleString()} Cal/g`;
      return null;
    }},
    { key: "wc", label: "Agua (contenido)", method: "ASTM D6304", extract: (lr) => lr.waterContent != null ? `${lr.waterContent} PPM` : null },
    { key: "wkf", label: "Agua (Karl Fischer)", method: "ASTM E203", extract: (lr) => lr.waterByKFPct != null ? `${lr.waterByKFPct}%` : null },
    { key: "ws", label: "Agua y sedimento", method: "ASTM D4007", extract: (lr) => lr.waterSedimentPct != null ? `${lr.waterSedimentPct}%` : null },
    { key: "s", label: "Azufre", method: "ASTM D4951", extract: (lr) => lr.sulfurPercent != null ? `${lr.sulfurPercent}% m/m` : null },
    { key: "cr", label: "Residuo carbón", method: "ASTM D4530", extract: (lr) => lr.carbonResidue != null ? `${lr.carbonResidue}%` : null },
    { key: "ash", label: "Cenizas", method: "ASTM D482", extract: (lr) => lr.ashContent != null ? `${lr.ashContent}%` : null },
    { key: "crep", label: "Crepitación", extract: (lr) => lr.crepitation },
    { key: "app", label: "Apariencia", extract: (lr) => lr.appearance },
    { key: "color", label: "Color", extract: (lr) => lr.color },
  ];

  // Only show rows where at least one result has data
  const activeParams = params.filter((p) =>
    results.some((lr) => p.extract(lr) != null)
  );

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
      <div className="px-5 py-4 border-b border-eco-border">
        <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
          Comparación — {results.length} muestras
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-eco-border">
              <th className="text-left py-3 px-4 text-[9px] text-eco-muted uppercase tracking-wider font-semibold w-40">
                Parámetro
              </th>
              {results.map((lr) => {
                const ps = getProductStyle(lr.productClassification);
                return (
                  <th key={lr.id} className="text-center py-3 px-3">
                    <div className="text-[10px] font-semibold text-eco-ink">{lr.labName}</div>
                    <div className="text-[8px] text-eco-muted font-mono mt-0.5">
                      {lr.sampleNumber}
                    </div>
                    {lr.productClassification && (
                      <span
                        className="inline-block text-[7px] font-semibold px-1.5 py-0.5 rounded-full mt-1"
                        style={{ color: ps.color, background: ps.bg }}
                      >
                        {lr.productClassification}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activeParams.map((param, idx) => (
              <tr
                key={param.key}
                className={`border-b border-eco-border/30 ${
                  idx % 2 === 0 ? "bg-eco-surface-2/20" : ""
                }`}
              >
                <td className="py-2.5 px-4">
                  <div className="text-xs font-medium text-eco-ink">{param.label}</div>
                  {param.method && (
                    <div className="text-[7px] text-eco-muted-2 font-mono">{param.method}</div>
                  )}
                </td>
                {results.map((lr) => {
                  const val = param.extract(lr);
                  return (
                    <td key={lr.id} className="py-2.5 px-3 text-center">
                      {val != null ? (
                        <span className="font-mono font-bold text-eco-ink">{val}</span>
                      ) : (
                        <span className="text-eco-muted-2">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Verdict row */}
            <tr className="bg-eco-surface-2/40">
              <td className="py-3 px-4 text-xs font-semibold text-eco-muted">Dictamen</td>
              {results.map((lr) => (
                <td key={lr.id} className="py-3 px-3 text-center">
                  <span className="text-[10px] text-eco-ink leading-snug">
                    {lr.verdict || "—"}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
